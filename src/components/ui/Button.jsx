import { forwardRef } from 'react';

// Single button primitive. Variants map to the visual system; behaviour is
// passed straight through (onClick, type, disabled, aria-*).
const Button = forwardRef(function Button(
  { variant = 'ghost', size, loading = false, disabled = false, className = '', children, ...rest },
  ref
) {
  const cls = ['btn', `btn--${variant}`, size === 'sm' && 'btn--sm', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      className={cls}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {children}
    </button>
  );
});

export default Button;
