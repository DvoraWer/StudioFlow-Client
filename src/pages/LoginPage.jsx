import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Field from '../components/ui/Field.jsx';
import Button from '../components/ui/Button.jsx';
import Notice from '../components/ui/Notice.jsx';

// Screen 1 (spec §39, §40): login + registration, store JWT, show auth errors.
export default function LoginPage() {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const destination = location.state?.from?.pathname || '/';

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  if (isAuthenticated) {
    return <Navigate to={destination} replace />;
  }

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'register') {
        await register(form.name.trim(), form.email.trim(), form.password);
      }
      await login(form.email.trim(), form.password);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <section className="auth__brand">
        <div>
          <div className="auth__wordmark">
            Studio<span>Flow</span>
          </div>
          <p className="auth__tagline">Move with intention.</p>
        </div>
        <p className="auth__foot">Studio resource management · seats · waitlists · flow</p>
      </section>

      <section className="auth__panel">
        <span className="eyebrow">{mode === 'register' ? 'New account' : 'Access'}</span>

        <div className="tabset" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`tab${mode === 'login' ? ' is-active' : ''}`}
            onClick={() => setMode('login')}
          >
            Log in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={`tab${mode === 'register' ? ' is-active' : ''}`}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <form onSubmit={submit} noValidate={false}>
          {mode === 'register' && (
            <Field
              label="Name"
              value={form.name}
              onChange={set('name')}
              required
              minLength={2}
              maxLength={200}
              autoComplete="name"
            />
          )}
          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={set('email')}
            required
            autoComplete="email"
          />
          <Field
            label="Password"
            type="password"
            value={form.password}
            onChange={set('password')}
            required
            minLength={8}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          />

          {error && <Notice tone="error" code="Auth" message={error} />}

          <div className="form-foot">
            <Button type="submit" variant="primary" loading={busy} className="btn--block">
              {busy ? 'Working…' : mode === 'register' ? 'Create account & sign in' : 'Sign in'}
            </Button>
          </div>
        </form>

        <div className="sysnote">
          <b>System note</b>
          <br />
          New accounts are always Members.
          <br />
          Demo · password <b>Password123!</b>
          <br />
          admin@studioflow.local · instructor@studioflow.local · member1@studioflow.local
        </div>
      </section>
    </div>
  );
}
