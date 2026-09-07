// Labelled <select> — the sibling of Field. `options` is [{ value, label }].
export default function SelectField({ label, id, options = [], placeholder, ...selectProps }) {
  const selectId = id || `s-${String(label).toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div className="field">
      <label className="field__label" htmlFor={selectId}>
        {label}
      </label>
      <select id={selectId} {...selectProps}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
