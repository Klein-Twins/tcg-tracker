import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  clearPersistedState,
  loadPersistedState,
  savePersistedState,
  type ImportSnapshot,
  type PersistedState,
} from '../storage/persistence';
import type { Card, ImportResult, SetSummary, Status } from '../types';
import { importCsvRows } from '../utils/csvImport';
import { loadAllMasterSets } from '../utils/masterSetLoader';
import { buildSetSummaries, filterCards, getSetSummary } from '../utils/setQueries';

interface TrackerContextValue {
  ready: boolean;
  loading: boolean;
  error: string | null;
  sets: SetSummary[];
  collectrImported: boolean;
  tcgplayerImported: boolean;
  collectrResult: ImportSnapshot | null;
  tcgplayerResult: ImportSnapshot | null;
  getCards: (slug: string, params: { status?: Status; q?: string; sort?: string }) => Card[];
  getSet: (slug: string) => SetSummary | null;
  updateCardStatus: (cardId: string, status: Status) => void;
  importCollectr: (file: File) => Promise<ImportResult>;
  importTcgplayer: (file: File) => Promise<ImportResult>;
  resetAll: () => Promise<void>;
}

const TrackerContext = createContext<TrackerContextValue | null>(null);

function cardsToStatusMap(cards: Card[]): Record<string, Status> {
  const map: Record<string, Status> = {};
  for (const c of cards) {
    if (c.status !== 'NEEDED') map[c.id] = c.status;
  }
  return map;
}

export function TrackerProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [setNames, setSetNames] = useState<Map<string, string>>(new Map());
  const [persisted, setPersisted] = useState<PersistedState>(() => loadPersistedState());
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback((nextCards: Card[], nextMeta: Partial<PersistedState>) => {
    const statuses = cardsToStatusMap(nextCards);
    const next: PersistedState = {
      statuses,
      collectrImported: nextMeta.collectrImported ?? persisted.collectrImported,
      tcgplayerImported: nextMeta.tcgplayerImported ?? persisted.tcgplayerImported,
      collectrResult: nextMeta.collectrResult ?? persisted.collectrResult,
      tcgplayerResult: nextMeta.tcgplayerResult ?? persisted.tcgplayerResult,
    };
    savePersistedState(next);
    setPersisted(next);
  }, [persisted]);

  const bootstrap = useCallback(async (statusOverrides: Record<string, Status>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadAllMasterSets(statusOverrides);
      setSetNames(data.setNames);
      setCards(data.cards);
      setReady(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load master sets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void bootstrap(loadPersistedState().statuses);
  }, [bootstrap]);

  const cardsBySet = useMemo(() => {
    const map = new Map<string, Card[]>();
    for (const card of cards) {
      const list = map.get(card.setSlug) ?? [];
      list.push(card);
      map.set(card.setSlug, list);
    }
    return map;
  }, [cards]);

  const sets = useMemo(() => buildSetSummaries(cards, setNames), [cards, setNames]);

  const getCards = useCallback(
    (slug: string, params: { status?: Status; q?: string; sort?: string }) =>
      filterCards(slug, cards, params),
    [cards],
  );

  const getSet = useCallback((slug: string) => getSetSummary(slug, cards, setNames), [cards, setNames]);

  const updateCardStatus = useCallback(
    (cardId: string, status: Status) => {
      setCards((prev) => {
        const next = prev.map((c) => (c.id === cardId ? { ...c, status } : c));
        persist(next, {});
        return next;
      });
    },
    [persist],
  );

  const runImport = useCallback(
    async (kind: 'collectr' | 'tcgplayer', file: File, targetStatus: Status): Promise<ImportResult> => {
      if (kind === 'collectr' && persisted.collectrImported) {
        throw new Error('Collectr export has already been imported. Use Reset to start over.');
      }
      if (kind === 'tcgplayer' && persisted.tcgplayerImported) {
        throw new Error('TCGPlayer orders have already been imported. Use Reset to start over.');
      }

      const text = await file.text();
      const { result, updatedCards } = importCsvRows(text, targetStatus, cardsBySet, true);

      const next = cards.map((c) => {
        const status = updatedCards.get(c.id);
        return status ? { ...c, status } : c;
      });
      const nextPersisted: PersistedState = {
        statuses: cardsToStatusMap(next),
        collectrImported: kind === 'collectr' ? true : persisted.collectrImported,
        tcgplayerImported: kind === 'tcgplayer' ? true : persisted.tcgplayerImported,
        collectrResult: kind === 'collectr' ? result : persisted.collectrResult,
        tcgplayerResult: kind === 'tcgplayer' ? result : persisted.tcgplayerResult,
      };
      savePersistedState(nextPersisted);
      setPersisted(nextPersisted);
      setCards(next);

      return result;
    },
    [cards, cardsBySet, persisted],
  );

  const importCollectr = useCallback((file: File) => runImport('collectr', file, 'OWNED'), [runImport]);
  const importTcgplayer = useCallback((file: File) => runImport('tcgplayer', file, 'ORDERED'), [runImport]);

  const resetAll = useCallback(async () => {
    clearPersistedState();
    setPersisted(loadPersistedState());
    await bootstrap({});
  }, [bootstrap]);

  const value: TrackerContextValue = {
    ready,
    loading,
    error,
    sets,
    collectrImported: persisted.collectrImported,
    tcgplayerImported: persisted.tcgplayerImported,
    collectrResult: persisted.collectrResult,
    tcgplayerResult: persisted.tcgplayerResult,
    getCards,
    getSet,
    updateCardStatus,
    importCollectr,
    importTcgplayer,
    resetAll,
  };

  return <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>;
}

export function useTracker(): TrackerContextValue {
  const ctx = useContext(TrackerContext);
  if (!ctx) throw new Error('useTracker must be used within TrackerProvider');
  return ctx;
}
