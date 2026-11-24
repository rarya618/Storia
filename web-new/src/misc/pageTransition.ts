import { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { seenDocument } from "./seen";

// Opening a document from its miniature page: the sheet you clicked grows into
// the editor's desk, so the page you chose is the page you land on. It's a View
// Transition: the sheet and the desk share the name sw-page, and everything else
// crossfades quickly underneath (see world.css).
//
// The router renders a navigation inside React's startTransition, so the new
// screen can't be forced out synchronously. Instead the transition waits for the
// editor to say its page is on screen (pageReady), or 450ms at most, so a slow
// load never leaves the old screen frozen.

type ViewTransition = { ready: Promise<void>, finished: Promise<void> };
type WithViewTransitions = Document & { startViewTransition?: (update: () => Promise<void>) => ViewTransition };

const PAGE = "sw-page";
const WAIT_MS = 450;
let ready: (() => void) | undefined;

// the editor calls this once its page has rendered
export const pageReady = () => ready?.();

const canMorph = () =>
  typeof (document as WithViewTransitions).startViewTransition === "function" &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// a plain left click, not one meant for a new tab or window
const isPlainClick = (event: MouseEvent) =>
  !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

// an onClick for a link to a document that holds its miniature page (.sw-sheet).
// The morph runs only when the editor can draw the page on its first frame, that
// is when this tab has already read the document; otherwise, without View
// Transitions, or with reduced motion, the link simply navigates
export const useOpenPage = () => {
  const navigate = useNavigate();

  return (documentId: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainClick(event) || !canMorph() || !seenDocument(documentId)) return;
    const sheet = event.currentTarget.querySelector<HTMLElement>(".sw-sheet");
    if (!sheet) return;

    event.preventDefault();
    const root = document.documentElement;
    sheet.style.setProperty("view-transition-name", PAGE);
    root.classList.add("sw-opening");

    const transition = (document as WithViewTransitions).startViewTransition!(() => new Promise<void>(resolve => {
      const done = () => { ready = undefined; resolve(); };
      ready = done;
      navigate("/document/" + documentId);
      window.setTimeout(done, WAIT_MS);
    }));
    // a transition skipped (another one started, the tab hid) rejects ready; the navigation still happens
    transition.ready.catch(() => {});
    transition.finished.finally(() => {
      root.classList.remove("sw-opening");
      sheet.style.removeProperty("view-transition-name");
    });
  };
};
