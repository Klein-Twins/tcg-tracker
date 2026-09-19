import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTracker } from '../context/TrackerContext';
import type { Card, Status } from '../types';
import { setAccent, setBadge } from '../utils/setVisuals';

const STATUS_OPTIONS: Status[] = ['NEEDED', 'ORDERED', 'OWNED'];

export function SetDetailPage() {
  const { slug = '' } = useParams();
  const { getSet, getCards, updateCardStatus, ready, loading } = useTracker();
  const [statusFilter, setStatusFilter] = useState<Status | 'ALL'>('ALL');
  const [sort, setSort] = useState('number');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const setInfo = useMemo(() => (slug ? getSet(slug) : null), [getSet, slug]);

  const cards: Card[] = useMemo(() => {
    if (!slug || !ready) return [];
    return getCards(slug, {
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      q: debouncedQuery || undefined,
      sort,
    });
  }, [slug, ready, getCards, statusFilter, debouncedQuery, sort]);

  if (!slug) return null;

  const accent = setAccent(slug);

  function onStatusChange(cardId: string, status: Status) {
    updateCardStatus(cardId, status);
  }

  return (
    <div className="page">
      <Link to="/" className="back-link">
        ← All sets
      </Link>

      <header className="set-detail-header">
        <div className="set-icon large" style={{ background: accent }}>
          {setBadge(slug)}
        </div>
        <div>
          <h1>{setInfo?.name ?? slug.replaceAll('-', ' ')}</h1>
          {setInfo && (
            <>
              <p className="muted">
                {setInfo.completionPercent.toFixed(1)}% complete · {setInfo.ownedCount} owned ·{' '}
                {setInfo.orderedCount} ordered · {setInfo.neededCount} needed
              </p>
              <div className="progress-bar wide">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min(setInfo.completionPercent, 100)}%` }}
                />
              </div>
            </>
          )}
        </div>
      </header>

      <section className="panel controls">
        <input
          className="search-input"
          placeholder="Search name or number…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as Status | 'ALL')}>
          <option value="ALL">All statuses</option>
          <option value="NEEDED">Needed</option>
          <option value="ORDERED">Ordered</option>
          <option value="OWNED">Owned</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="number">Sort: Card #</option>
          <option value="name">Sort: Name</option>
          <option value="status">Sort: Status</option>
          <option value="rarity">Sort: Rarity</option>
          <option value="foil">Sort: Foil</option>
        </select>
      </section>

      {loading && !ready && <p className="muted">Loading cards…</p>}

      {ready && (
        <section className="panel card-table-wrap">
          <table className="card-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Rarity</th>
                <th>Foil</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card) => (
                <tr key={card.id} className={`row-${card.status.toLowerCase()}`}>
                  <td>{card.cardNumber}</td>
                  <td>{card.name}</td>
                  <td>{card.rarity}</td>
                  <td>{card.foilType}</td>
                  <td>
                    <select
                      className={`status-select status-${card.status.toLowerCase()}`}
                      value={card.status}
                      onChange={(e) => onStatusChange(card.id, e.target.value as Status)}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0) + status.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cards.length === 0 && <p className="muted empty">No cards match your filters.</p>}
        </section>
      )}
    </div>
  );
}
