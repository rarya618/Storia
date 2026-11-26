// whether a panel is open, remembered per viewer; storage can be unavailable,
// so every access is guarded
export const readPanel = (key: string, fallback: boolean) => {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? fallback : saved === "true";
  } catch { return fallback; }
};

export const writePanel = (key: string, open: boolean) => {
  try { localStorage.setItem(key, String(open)); } catch { /* not persisted */ }
};
