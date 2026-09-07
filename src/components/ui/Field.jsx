// Labelled text input for the auth forms. All native validation attributes
// (required, minLength, type…) pass straight through.
export default function Field({ label, id, ...inputProps }) {
  const inputId = id || `f-${String(label).toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div className="field">
      <label className="field__label" htmlFor={inputId}>
        {label}
      </label>
      <input id={inputId} {...inputProps} />
    </div>
  );
}
