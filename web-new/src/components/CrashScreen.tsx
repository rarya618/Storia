import { AuthCard } from "./AuthCard";

// shown in place of the app when a screen throws while drawing (the error
// boundary in main.tsx), instead of a blank page. A reload starts it fresh
const CrashScreen = () => (
  <AuthCard title="Something went wrong">
    <p className="mb-6 text-base text-[color:var(--muted)]">Storia ran into a problem showing this page. It saves as you type, so reloading should bring your work back.</p>
    <div className="flex flex-col gap-2">
      <button type="button" className="sw-button sw-button-soft !h-12 w-full justify-center !text-base" onClick={() => window.location.reload()}>Reload</button>
      <a href="/home" className="sw-button !h-12 w-full justify-center !text-base">Go home</a>
    </div>
  </AuthCard>
);

export default CrashScreen;
