import { Link } from "react-router-dom";
import { useTitle } from "../misc/title";
import { AuthCard } from "../components/AuthCard";

// if there is no existing page
function PageNotFound() {
  useTitle("Page not found");

  return (
    <AuthCard title="Page not found">
      <p className="mb-5 text-sm text-[color:var(--muted)]">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="sw-button sw-button-soft w-full justify-center">Go home</Link>
    </AuthCard>
  );
}

export default PageNotFound;
