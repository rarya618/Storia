import { ReactNode, useEffect, useState } from 'react';
import { useHoldScreen } from '../misc/screenHold';
import "../screenplay/world.css";

// how long to wait before suggesting something might be wrong
const SLOW_AFTER_MS = 12000;

const SlowNote = () => (
  <div className="max-w-xs">
    <p className="mb-4 text-sm text-[color:var(--muted)]">This is taking longer than usual. Check your connection, then try again.</p>
    <button type="button" className="sw-button" onClick={() => window.location.reload()}>Try again</button>
  </div>
);

// A screen that's still loading. With a skeleton, the screen's own shape shows
// at once, so a screen change never passes through a blank frame (inside Shell,
// the previous screen still stays up for its moment first). Without one, a
// spinner fades in once the wait is noticeable. Either way, after 12s it says
// something may be wrong and offers to try again
const Loading = ({skeleton}: {skeleton?: ReactNode}) => {
  const [isSlow, setSlow] = useState(false);
  // inside Shell, keep the previous screen up while this one loads
  useHoldScreen();

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  if (skeleton) {
    return (
      <div role="status" aria-busy="true" className="sw sw-rev relative flex min-w-0 flex-1">
        <span className="sr-only">Loading</span>
        {skeleton}
        {isSlow && (
          <div className="pointer-events-none absolute inset-x-0 top-[96px] flex justify-center px-4">
            <div className="sw-float pointer-events-auto rounded-[12px] px-5 py-4 text-center"><SlowNote /></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div role="status" className="sw sw-rev sw-wait flex min-w-0 flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="sw-spinner" aria-hidden="true" />
      <span className="sr-only">Loading</span>
      {isSlow && <SlowNote />}
    </div>
  )
}

export default Loading;
