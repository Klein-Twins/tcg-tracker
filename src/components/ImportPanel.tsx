import { useState } from 'react';
import { useTracker } from '../context/TrackerContext';

export function ImportPanel() {
  const {
    importCollectr,
    importTcgplayer,
    resetAll,
    collectrImported,
    tcgplayerImported,
    collectrResult,
    tcgplayerResult,
  } = useTracker();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<'collectr' | 'tcgplayer' | 'reset' | null>(null);

  async function handleImport(kind: 'collectr' | 'tcgplayer', file: File | undefined) {
    if (!file) return;
    setError(null);
    setLoading(kind);
    try {
      if (kind === 'collectr') await importCollectr(file);
      else await importTcgplayer(file);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setLoading(null);
    }
  }

  async function handleReset() {
    const ok = window.confirm(
      'Reset all card statuses to Needed, clear import history, and allow Collectr / TCGPlayer imports again?',
    );
    if (!ok) return;
    setError(null);
    setLoading('reset');
    try {
      await resetAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reset failed');
    } finally {
      setLoading(null);
    }
  }

  const busy = loading !== null;

  return (
    <section className="panel import-panel">
      <h2>Import data</h2>
      <p className="muted">
        Upload a Collectr collection export to mark owned cards, or a TCGPlayer / OrderWand order CSV to mark
        ordered cards. Each source can be imported once; use Reset to clear everything and import again.
      </p>
      <div className="import-actions">
        <label className={`import-button${collectrImported ? ' disabled' : ''}`}>
          <span>
            {loading === 'collectr'
              ? 'Importing…'
              : collectrImported
                ? 'Collectr imported'
                : 'Import Collectr export'}
          </span>
          <input
            type="file"
            accept=".csv"
            disabled={busy || collectrImported}
            onChange={(e) => {
              void handleImport('collectr', e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </label>
        <label className={`import-button secondary${tcgplayerImported ? ' disabled' : ''}`}>
          <span>
            {loading === 'tcgplayer'
              ? 'Importing…'
              : tcgplayerImported
                ? 'TCGPlayer imported'
                : 'Import TCGPlayer orders'}
          </span>
          <input
            type="file"
            accept=".csv"
            disabled={busy || tcgplayerImported}
            onChange={(e) => {
              void handleImport('tcgplayer', e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </label>
        <button type="button" className="import-button danger" disabled={busy} onClick={() => void handleReset()}>
          {loading === 'reset' ? 'Resetting…' : 'Reset all data'}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      {(collectrResult || tcgplayerResult) && (
        <div className="import-results">
          {collectrResult && (
            <p>
              Collectr: {collectrResult.cardsUpdated} updated / {collectrResult.cardsMatched} matched (
              {collectrResult.rowsSkipped} skipped)
            </p>
          )}
          {tcgplayerResult && (
            <p>
              TCGPlayer: {tcgplayerResult.cardsUpdated} updated / {tcgplayerResult.cardsMatched} matched (
              {tcgplayerResult.rowsSkipped} skipped)
            </p>
          )}
        </div>
      )}
    </section>
  );
}
