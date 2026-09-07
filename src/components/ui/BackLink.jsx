import { Link } from 'react-router-dom';

export default function BackLink({ to, children }) {
  return (
    <Link to={to} className="backlink">
      <span aria-hidden="true">←</span> {children}
    </Link>
  );
}
