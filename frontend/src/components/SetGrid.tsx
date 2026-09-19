import { Link } from 'react-router-dom';
import type { SetSummary } from '../types';
import { setAccent, setBadge } from '../utils/setVisuals';

interface Props {
  sets: SetSummary[];
}

export function SetGrid({ sets }: Props) {
  if (sets.length === 0) {
    return <p className="muted">No master sets loaded yet.</p>;
  }

  return (
    <div className="set-grid">
      {sets.map((set) => {
        const accent = setAccent(set.slug);
        const lightText = set.slug === 'WHITE-FLARE';
        return (
          <Link key={set.slug} to={`/sets/${set.slug}`} className="set-card">
            <div className="set-icon" style={{ background: accent, color: lightText ? '#263238' : '#fff' }}>
              {setBadge(set.slug)}
            </div>
            <div className="set-meta">
              <h3>{set.name}</h3>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(set.completionPercent, 100)}%` }} />
              </div>
              <p className="muted">
                {set.completionPercent.toFixed(1)}% owned · {set.ownedCount}/{set.totalCards}
              </p>
              <p className="stat-row">
                <span className="pill owned">{set.ownedCount} owned</span>
                <span className="pill ordered">{set.orderedCount} ordered</span>
                <span className="pill needed">{set.neededCount} needed</span>
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
