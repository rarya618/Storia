// Autosave for a script: a change is saved after a pause, one save at a time
// (whatever changes meanwhile goes in the next), and a failed save is tried
// again until one lands, keeping the newest script. Plain timers and promises,
// no React, so it can be tested on its own.

export type SaveStatus = "saved" | "saving" | "error";

type Options<T> = {
  write: (content: T) => Promise<void>,
  onStatus: (status: SaveStatus) => void,
  delay: number,
  retry: number,
};

export function createSaver<T>({write, onStatus, delay, retry}: Options<T>) {
  // the content waiting to be written, if it changed since the last write
  let unsaved: T | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let inFlight = false;

  const flush = async () => {
    clearTimeout(timer);
    timer = undefined;
    if (inFlight || unsaved === null) return;
    const content = unsaved;
    unsaved = null;
    inFlight = true;
    onStatus("saving");
    try {
      await write(content);
      inFlight = false;
      if (unsaved !== null) await flush();
      else onStatus("saved");
    } catch {
      inFlight = false;
      unsaved ??= content;
      onStatus("error");
      timer = setTimeout(flush, retry);
    }
  };

  return {
    change(content: T) {
      unsaved = content;
      clearTimeout(timer);
      timer = setTimeout(flush, delay);
    },
    // write now, without waiting for the pause
    flush,
  };
}
