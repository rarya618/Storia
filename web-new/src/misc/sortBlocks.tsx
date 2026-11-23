type Dated = {lastUpdated?: string, createdOn?: string};

// dates are stored as Date.toString() ("Mon Nov 23 2026 …"), so compare them as times, never as text
export const touchedAt = (block: Dated) => Date.parse(block.lastUpdated ?? block.createdOn ?? "") || 0;

// most recently updated (or, failing that, created) first
export const byLatest = <T extends Dated>(blocks: T[]) => [...blocks].sort((a, b) => touchedAt(b) - touchedAt(a));

// legacy: the home grid's newest-created-first order, until home moves to byLatest
export const sortBlocksByCreatedOn = <T extends {createdOn: string}>(blocks: T[]) =>
  blocks.sort((a, b) => (Date.parse(b.createdOn) || 0) - (Date.parse(a.createdOn) || 0));
