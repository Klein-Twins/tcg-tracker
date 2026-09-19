import { ImportPanel } from '../components/ImportPanel';
import { SetGrid } from '../components/SetGrid';
import { useTracker } from '../context/TrackerContext';

export function HomePage() {
  const { sets, loading, error, ready } = useTracker();

  const totals = sets.reduce(
    (acc, s) => ({
      total: acc.total + s.totalCards,
      owned: acc.owned + s.ownedCount,
      ordered: acc.ordered + s.orderedCount,
      needed: acc.needed + s.neededCount,
    }),
    { total: 0, owned: 0, ordered: 0, needed: 0 },
  );
  const overall = totals.total === 0 ? 0 : (totals.owned / totals.total) * 100;

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Master set tracker</p>
          <h1>TCG Tracker</h1>
          <p className="muted">Track owned, ordered, and needed cards across your PokeCottage master sets.</p>
        </div>
        <div className="hero-stats panel">
          <div>
            <span className="stat-label">Overall completion</span>
            <strong>{overall.toFixed(1)}%</strong>
          </div>
          <div>
            <span className="stat-label">Owned</span>
            <strong>{totals.owned}</strong>
          </div>
          <div>
            <span className="stat-label">Ordered</span>
            <strong>{totals.ordered}</strong>
          </div>
          <div>
            <span className="stat-label">Needed</span>
            <strong>{totals.needed}</strong>
          </div>
        </div>
      </header>

      <ImportPanel />

      <section className="panel">
        <div className="section-head">
          <h2>Sets</h2>
          {loading && !ready && <span className="muted">Loading master sets…</span>}
        </div>
        {error && <p className="error">{error}</p>}
        {ready && !error && <SetGrid sets={sets} />}
      </section>
    </div>
  );
}
