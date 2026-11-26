import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSaver, SaveStatus } from "./saver";

const setup = (write: (content: string) => Promise<void>) => {
  const statuses: SaveStatus[] = [];
  const saver = createSaver({write, onStatus: status => statuses.push(status), delay: 800, retry: 5000});
  return {saver, statuses};
};

describe("createSaver", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("saves once, after the pause, with the latest change", async () => {
    const write = vi.fn(async () => {});
    const {saver, statuses} = setup(write);
    saver.change("a");
    await vi.advanceTimersByTimeAsync(500);
    saver.change("ab");
    await vi.advanceTimersByTimeAsync(500);
    expect(write).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(300);
    expect(write).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenCalledWith("ab");
    expect(statuses).toEqual(["saving", "saved"]);
  });

  it("writes at once on flush, and does nothing with no change", async () => {
    const write = vi.fn(async () => {});
    const {saver} = setup(write);
    await saver.flush();
    expect(write).not.toHaveBeenCalled();
    saver.change("a");
    await saver.flush();
    expect(write).toHaveBeenCalledWith("a");
    await vi.advanceTimersByTimeAsync(1000);
    expect(write).toHaveBeenCalledTimes(1);
  });

  it("holds a change made during a save for the next one", async () => {
    let finish = () => {};
    const write = vi.fn<(content: string) => Promise<void>>()
      .mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }))
      .mockResolvedValue();
    const {saver} = setup(write);
    saver.change("a");
    const first = saver.flush();
    saver.change("ab");
    await saver.flush(); // a second save doesn't start while one is out
    expect(write).toHaveBeenCalledTimes(1);
    finish();
    await first;
    expect(write).toHaveBeenLastCalledWith("ab");
  });

  it("retries a failed save, keeping the newest script", async () => {
    const write = vi.fn<(content: string) => Promise<void>>().mockRejectedValueOnce(new Error("offline")).mockResolvedValue();
    const {saver, statuses} = setup(write);
    saver.change("a");
    await saver.flush();
    expect(statuses).toEqual(["saving", "error"]);
    saver.change("ab");
    await vi.advanceTimersByTimeAsync(800);
    expect(write).toHaveBeenLastCalledWith("ab");
    expect(statuses.at(-1)).toBe("saved");
    await vi.advanceTimersByTimeAsync(5000);
    expect(write).toHaveBeenCalledTimes(2);
  });
});
