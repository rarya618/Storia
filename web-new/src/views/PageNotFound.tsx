import { PurpleButton } from "../components/Button";
import { useTitle } from "../misc/title";

// if there is no existing page
function PageNotFound() {
  useTitle("Page not found");

  return (
    <main className="flex w-screen h-screen px-4 bg-purple-tint dark:bg-neutral-800">
      <div className="m-auto max-w-sm px-8 py-8 rounded-lg bg-white dark:bg-neutral-900 shadow text-center">
        <p className="logo text-3xl text-purple mb-3">Storia</p>
        <h1 className="display text-xl text-purple mb-1">Page not found</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">The page you're looking for doesn't exist or has moved.</p>
        <PurpleButton text="Go home" link="/" />
      </div>
    </main>
  );
}

export default PageNotFound;
