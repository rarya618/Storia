import * as Sentry from "@sentry/react";
import { appCommit, appVersion } from "./version";

// A production build reports errors to Sentry when it's built with
// VITE_SENTRY_DSN (kept in the gitignored .env.production.local). A dev build,
// on the emulators or live, never reports, and a build without the DSN doesn't either
const dsn = import.meta.env.VITE_SENTRY_DSN;
const reports = import.meta.env.PROD && !!dsn;

// before the app renders, so a crash on the first frame is caught too. Sentry's
// default integrations report uncaught errors and unhandled rejections themselves
export const startMonitoring = () => {
  if (!reports) return;
  Sentry.init({
    dsn,
    release: "storia-web@" + appVersion,
    dist: appCommit,
    environment: "production",
    // Sentry collects all of these unless told not to. A report names the writer
    // only by the uid monitorUser sets: no IP address, cookies, headers or bodies,
    // and no local variables, which could hold their script
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      stackFrameVariables: false,
    },
    // what the app prints to the console can carry a writer's text
    beforeBreadcrumb: (crumb) => crumb.category === "console" ? null : crumb,
  });
};

// the signed-in writer's uid, so one writer's reports can be found together
export const monitorUser = (uid: string | undefined) => {
  if (reports) Sentry.setUser(uid ? {id: uid} : null);
};

// for an error the app catches and carries on from, but you'd want to hear
// about: logged to the console everywhere, and reported from production.
// `where` names what failed ("autosave"), and becomes the report's tag
export const logError = (where: string, error: unknown) => {
  console.error(where + ":", error);
  if (reports) Sentry.captureException(error, {tags: {where}});
};

export const ErrorBoundary = Sentry.ErrorBoundary;
