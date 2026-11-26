import { useTitle } from "../misc/title";
import { AuthCard } from "../components/AuthCard";

// if there is no existing page
function PageNotFound() {
  useTitle("Page not found");

  return (
    <AuthCard title="Page not found">
      <p className="mb-6 text-base text-[color:var(--muted)]">The page you're looking for doesn't exist or has moved.</p>
      <a href="/" className="sw-button sw-button-soft !h-12 w-full justify-center !text-base">Go home</a>
    </AuthCard>
  );
}

export default PageNotFound;
