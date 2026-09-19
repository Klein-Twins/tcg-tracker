import type { Status } from '../types';

const STORAGE_KEY = 'tcg-tracker-state';

export interface PersistedState {
  statuses: Record<string, Status>;
  collectrImported: boolean;
  tcgplayerImported: boolean;
  collectrResult: ImportSnapshot | null;
  tcgplayerResult: ImportSnapshot | null;
}

export interface ImportSnapshot {
  rowsProcessed: number;
  cardsMatched: number;
  cardsUpdated: number;
  rowsSkipped: number;
}

const EMPTY: PersistedState = {
  statuses: {},
  collectrImported: false,
  tcgplayerImported: false,
  collectrResult: null,
  tcgplayerResult: null,
};

export function loadPersistedState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY, statuses: {} };
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      statuses: parsed.statuses ?? {},
      collectrImported: Boolean(parsed.collectrImported),
      tcgplayerImported: Boolean(parsed.tcgplayerImported),
      collectrResult: parsed.collectrResult ?? null,
      tcgplayerResult: parsed.tcgplayerResult ?? null,
    };
  } catch {
    return { ...EMPTY, statuses: {} };
  }
}

export function savePersistedState(state: PersistedState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearPersistedState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
