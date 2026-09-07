import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getClass, cancelClass } from '../api/classes.js';
import * as registrations from '../api/registrations.js';
import * as waitlist from '../api/waitlist.js';
import { useAuth } from '../context/AuthContext.jsx';
import BackLink from '../components/ui/BackLink.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import CapacityMeter from '../components/ui/CapacityMeter.jsx';
import Notice from '../components/ui/Notice.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import RoleGate from '../components/ui/RoleGate.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';

const SEAT_TAKEN_MESSAGE =
  'The last available seat was taken by another user. Please refresh the class.';

const D_LONG = { weekday: 'long', month: 'long', day: 'numeric' };
const T = { hour: '2-digit', minute: '2-digit' };

// Screen 3 (spec §39, §41): full detail + tags + role-aware Register / Join Waitlist / Cancel.
export default function ClassDetailsPage() {
  const { id } = useParams();
  const classId = Number(id);
  const { isAuthenticated, role } = useAuth();

  const [cls, setCls] = useState(null);
  const [myRegistration, setMyRegistration] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionOk, setActionOk] = useState(null);
  const [busy, setBusy] = useState(false);

  // Admin-only: cancel the class (spec §21, POST /api/classes/{id}/cancel).
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelClassError, setCancelClassError] = useState(null);

  const isMember = isAuthenticated && role === 'Member';

  const load = useCallback(async () => {
    setLoadError(null);
    setActionError(null);
    try {
      const detail = await getClass(classId);
      setCls(detail);
      if (isMember) {
        const mine = await registrations.myRegistrations();
        setMyRegistration(
          mine.find((r) => r.classId === classId && r.status === 'Active') || null
        );
      } else {
        setMyRegistration(null);
      }
    } catch (err) {
      setLoadError(err);
    }
  }, [classId, isMember]);

  useEffect(() => {
    load();
  }, [load]);

  async function doCancelClass() {
    setCancelBusy(true);
    setCancelClassError(null);
    try {
      await cancelClass(classId);
      setCancelOpen(false);
      setActionError(null);
      setActionOk('Class cancelled.');
      await load();
    } catch (err) {
      setCancelClassError({ code: err.code, message: err.message });
    } finally {
      setCancelBusy(false);
    }
  }

  async function runAction(fn, successMessage) {
    setBusy(true);
    setActionError(null);
    setActionOk(null);
    try {
      const result = await fn();
      setActionOk(typeof successMessage === 'function' ? successMessage(result) : successMessage);
      await load();
    } catch (err) {
      // spec §41 — mandatory: the last-seat race must read clearly, never "Something went wrong".
      if (err.status === 409 && err.code === 'CONCURRENCY_CONFLICT') {
        setActionError({ code: 'CONCURRENCY_CONFLICT', message: SEAT_TAKEN_MESSAGE, ref: err.correlationId });
      } else if ([400, 404, 409].includes(err.status)) {
        setActionError({ code: err.code, message: err.message, ref: err.correlationId });
      } else {
        setActionError({
          code: err.code || 'ERROR',
          message: err.message || 'The action could not be completed.',
          ref: err.correlationId
        });
      }
    } finally {
      setBusy(false);
    }
  }

  if (loadError) {
    return (
      <div>
        <BackLink to="/classes">All classes</BackLink>
        <ErrorState error={loadError} onRetry={load} />
      </div>
    );
  }

  if (!cls) {
    return (
      <div>
        <BackLink to="/classes">All classes</BackLink>
        <div className="state">
          <div className="state__eyebrow">Loading class</div>
        </div>
      </div>
    );
  }

  const start = new Date(cls.startTime);
  const end = new Date(cls.endTime);
  const active = cls.status === 'Active';

  return (
    <div>
      <BackLink to="/classes">All classes</BackLink>

      <div className="detail__lead">
        <span className="eyebrow">Class · #{cls.id}</span>
        <StatusBadge label={cls.status} tone={active ? 'neutral' : 'bad'} />
        {active && cls.isFull && <StatusBadge label="Full" tone="bad" />}
        {isMember && myRegistration && <StatusBadge label="You're registered" tone="ok" />}
      </div>

      <h1 className="detail__title">{cls.name}</h1>
      <p className="detail__when">
        {start.toLocaleDateString(undefined, D_LONG)} · {start.toLocaleTimeString(undefined, T)} –{' '}
        {end.toLocaleTimeString(undefined, T)}
      </p>

      {cls.description && <p className="detail__desc">{cls.description}</p>}

      <div className="detail-grid">
        <div className="detail-cell">
          <div className="detail-cell__label">Instructor</div>
          <div className="detail-cell__value">{cls.instructorName}</div>
        </div>
        <div className="detail-cell">
          <div className="detail-cell__label">Room</div>
          <div className="detail-cell__value">{cls.roomName}</div>
        </div>
        <div className="detail-cell">
          <div className="detail-cell__label">Starts</div>
          <div className="detail-cell__value">{start.toLocaleString()}</div>
        </div>
        <div className="detail-cell">
          <div className="detail-cell__label">Ends</div>
          <div className="detail-cell__value">{end.toLocaleString()}</div>
        </div>
      </div>

      <div className="detail__capacity">
        <CapacityMeter capacity={cls.capacity} registeredCount={cls.registeredCount} size="lg" />
        <dl className="detail__meta-readout">
          <div className="detail__readout">
            <dt>Capacity</dt>
            <dd className="num">{cls.capacity}</dd>
          </div>
          <div className="detail__readout">
            <dt>Registered</dt>
            <dd className="num">{cls.registeredCount}</dd>
          </div>
          <div className="detail__readout">
            <dt>Seats open</dt>
            <dd className="num">{cls.availableSeats}</dd>
          </div>
        </dl>
      </div>

      {cls.tags.length > 0 && (
        <div className="tagrow" aria-label="Tags">
          {cls.tags.map((t) => (
            <span key={t.id} className="chip">
              {t.name}
            </span>
          ))}
        </div>
      )}

      <div className="actionbar">
        <Button variant="ghost" size="sm" type="button" onClick={load} disabled={busy}>
          Refresh
        </Button>

        <RoleGate allow={['Admin', 'Instructor']}>
          <Link to={`/classes/${cls.id}/participants`} className="btn btn--ghost btn--sm">
            View participants
          </Link>
        </RoleGate>

        <RoleGate allow="Admin">
          <Link to={`/admin/classes/${cls.id}/edit`} className="btn btn--ghost btn--sm">
            Edit
          </Link>
          {active && (
            <Button
              variant="danger"
              size="sm"
              type="button"
              disabled={cancelBusy}
              onClick={() => {
                setCancelClassError(null);
                setCancelOpen(true);
              }}
            >
              Cancel class
            </Button>
          )}
        </RoleGate>

        {!isAuthenticated && (
          <Link to="/login" className="btn btn--primary btn--sm">
            Log in to register
          </Link>
        )}

        {isAuthenticated && !isMember && (
          <span className="actionbar__note">Signed in as {role} — only members can register</span>
        )}

        {isMember && !active && <span className="actionbar__note">This class is cancelled</span>}

        {isMember && active && myRegistration && (
          <Button
            variant="danger"
            type="button"
            disabled={busy}
            onClick={() => runAction(() => registrations.cancel(cls.id), 'Registration cancelled.')}
          >
            Cancel Registration
          </Button>
        )}

        {isMember && active && !myRegistration && !cls.isFull && (
          <Button
            variant="primary"
            type="button"
            disabled={busy}
            onClick={() => runAction(() => registrations.register(cls.id), 'You are registered.')}
          >
            Register
          </Button>
        )}

        {isMember && active && !myRegistration && cls.isFull && (
          <>
            <Button
              variant="primary"
              type="button"
              disabled={busy}
              onClick={() =>
                runAction(
                  () => waitlist.join(cls.id),
                  (r) => `You are on the waiting list — position ${r.position}.`
                )
              }
            >
              Join Waitlist
            </Button>
            <Button
              variant="link"
              type="button"
              disabled={busy}
              onClick={() => runAction(() => waitlist.leave(cls.id), 'Removed from the waiting list.')}
            >
              Leave waiting list
            </Button>
          </>
        )}
      </div>

      {actionOk && <Notice tone="ok" code="Done" message={actionOk} />}
      {actionError && (
        <Notice
          tone="error"
          code={actionError.code}
          message={actionError.message}
          correlationId={actionError.ref}
        />
      )}

      <ConfirmDialog
        open={cancelOpen}
        title={`Cancel ${cls.name}?`}
        body="Registrations are kept for the record, but the class stops accepting new registrations and waitlist joins. This cannot be undone."
        confirmLabel="Cancel class"
        busy={cancelBusy}
        error={cancelClassError}
        onConfirm={doCancelClass}
        onCancel={() => {
          setCancelOpen(false);
          setCancelClassError(null);
        }}
      />
    </div>
  );
}
