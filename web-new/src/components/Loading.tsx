import { useEffect, useState } from 'react';
import { HashLoader } from 'react-spinners';
import { PurpleButton } from './Button';

// how long to wait before suggesting something might be wrong
const SLOW_AFTER_MS = 12000;

const Loading = () => {
  const [isSlow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div role="status" aria-label="Loading" className="w-full flex flex-col justify-center items-center gap-6 px-6 text-center">
      <HashLoader color="#6166B3" />
      {isSlow && (
        <div className="max-w-xs">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">This is taking longer than usual. Check your connection, then try again.</p>
          <PurpleButton text="Try again" onClick={() => window.location.reload()} />
        </div>
      )}
    </div>
  )
}

export default Loading;
