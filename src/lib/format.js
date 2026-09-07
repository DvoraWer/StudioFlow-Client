// Date/time helpers. The API stores UTC ISO strings; the UI shows local time and
// the class form round-trips through <input type="datetime-local">.

const pad = (n) => String(n).padStart(2, '0');

/** ISO (UTC) -> "YYYY-MM-DDTHH:mm" in local time, for datetime-local inputs. */
export function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

/** datetime-local value (local wall time) -> UTC ISO string for the API. */
export function fromLocalInput(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export const fmtDateTime = (iso) => new Date(iso).toLocaleString();
export const fmtDay = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: '2-digit' });
export const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
export const fmtLongDay = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
