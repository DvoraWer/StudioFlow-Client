import { Link } from 'react-router-dom';

// Intentional full-screen state for "not found" / "not authorized" routes.
export default function Guard({ code = '404', title, message, to = '/classes', action = 'Go to classes' }) {
  return (
    <div className="guard" role="alert">
      <span className="guard__code">{code}</span>
      <h1 className="guard__title">{title}</h1>
      <p className="guard__msg">{message}</p>
      <Link to={to} className="btn btn--primary btn--sm">
        {action}
      </Link>
    </div>
  );
}
