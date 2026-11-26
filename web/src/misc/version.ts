import { useEffect, useState } from "react";

// this build, as stamped by vite.config.ts
export const appVersion = __APP_VERSION__;
export const appCommit = __APP_COMMIT__;

// "0.1.0 · a1b2c3d"
export const versionLabel = appVersion + " · " + appCommit;

// how often an open tab asks whether a newer build has been deployed, besides
// whenever the tab comes back into view
const CHECK_EVERY_MS = 10 * 60 * 1000;

type Deployed = { version: string, commit: string, builtAt: string };

const fetchDeployed = async (): Promise<Deployed | undefined> => {
  try {
    const response = await fetch("/version.json", {cache: "no-store"});
    if (!response.ok) return undefined;
    return await response.json() as Deployed;
  } catch {
    return undefined;
  }
};

// the deployed build, once it differs from the one this tab is running.
// The dev server has no version.json, so it never asks
export const useNewerBuild = () => {
  const [newer, setNewer] = useState<Deployed>();

  useEffect(() => {
    if (import.meta.env.DEV) return;
    let gone = false;
    const check = async () => {
      const deployed = await fetchDeployed();
      if (gone || !deployed) return;
      // a different build at all, not only a higher version: a redeploy of the
      // same release with fixes still leaves this tab behind
      if (deployed.builtAt !== __APP_BUILT_AT__) setNewer(deployed);
    };
    const onVisible = () => { if (document.visibilityState === "visible") check(); };

    check();
    const timer = window.setInterval(check, CHECK_EVERY_MS);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      gone = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return newer;
};
