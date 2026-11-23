import { useEffect, useState } from 'react';
import { useHoldScreen } from '../misc/screenHold';
import "../screenplay/world.css";

// how long to wait before suggesting something might be wrong
const SLOW_AFTER_MS = 12000;

const Loading = () => {
  const [isSlow, setSlow] = useState(false);
  // inside Shell, keep the previous screen up while this one loads
  useHoldScreen();

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div role="status" className="sw sw-rev sw-wait flex min-w-0 flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="sw-spinner" aria-hidden="true" />
      <span className="sr-only">Loading</span>
      {isSlow && (
        <div className="max-w-xs">
          <p className="mb-4 text-sm text-[color:var(--muted)]">This is taking longer than usual. Check your connection, then try again.</p>
          <button type="button" className="sw-button" onClick={() => window.location.reload()}>Try again</button>
        </div>
      )}
    </div>
  )
}

export default Loading;
