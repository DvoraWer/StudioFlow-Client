import Guard from '../components/ui/Guard.jsx';

export default function NotFoundPage() {
  return (
    <Guard
      code="404"
      title="Nothing here"
      message="That route does not exist in StudioFlow."
      to="/classes"
      action="Go to classes"
    />
  );
}
