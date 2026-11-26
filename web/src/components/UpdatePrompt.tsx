import { useState } from "react";
import { useNewerBuild } from "../misc/version";
import StrokeIcon from "./screenplay/StrokeIcon";

// a Float note under the bar once a newer build has been deployed, so a tab
// left open doesn't keep writing in an old one. Reloading is the writer's
// call: the editor's own unsaved-work warning still stands in the way of
// losing anything
const UpdatePrompt = () => {
  const newer = useNewerBuild();
  // dismissed for this build only; a later deploy asks again
  const [dismissed, setDismissed] = useState<string>();

  if (!newer || dismissed === newer.builtAt) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[76px] z-[60] flex justify-center px-4">
      <div role="status" className="sw sw-rev sw-float pointer-events-auto flex items-center gap-3 rounded-[12px] py-2 pl-4 pr-2 text-sm">
        <p className="min-w-0">A new version of Storia is ready.</p>
        <button type="button" className="sw-button sw-button-soft !h-8 shrink-0 !px-3" onClick={() => window.location.reload()}>
          Reload
        </button>
        <button type="button" className="sw-icon shrink-0" onClick={() => setDismissed(newer.builtAt)} aria-label="Not now" title="Not now">
          <StrokeIcon name="close" size={16} />
        </button>
      </div>
    </div>
  );
};

export default UpdatePrompt;
