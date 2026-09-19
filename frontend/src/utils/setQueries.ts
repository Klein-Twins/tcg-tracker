import type { Card, SetSummary, Status } from '../types';
import { displayNameFromSlug } from './setNameResolver';

export function buildSetSummaries(cards: Card[], setNames: Map<string, string>): SetSummary[] {
  const bySlug = new Map<string, Card[]>();
  for (const card of cards) {
    const list = bySlug.get(card.setSlug) ?? [];
    list.push(card);
    bySlug.set(card.setSlug, list);
  }

  return [...bySlug.entries()]
    .map(([slug, setCards]) => {
      const ownedCount = setCards.filter((c) => c.status === 'OWNED').length;
      const orderedCount = setCards.filter((c) => c.status === 'ORDERED').length;
      const neededCount = setCards.filter((c) => c.status === 'NEEDED').length;
      const totalCards = setCards.length;
      const completionPercent = totalCards === 0 ? 0 : (ownedCount / totalCards) * 100;
      return {
        slug,
        name: setNames.get(slug) ?? displayNameFromSlug(slug),
        totalCards,
        ownedCount,
        orderedCount,
        neededCount,
        completionPercent,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getSetSummary(slug: string, cards: Card[], setNames: Map<string, string>): SetSummary | null {
  return buildSetSummaries(cards, setNames).find((s) => s.slug === slug) ?? null;
}

export function filterCards(
  slug: string,
  cards: Card[],
  params: { status?: Status; q?: string; sort?: string },
): Card[] {
  let list = cards.filter((c) => c.setSlug === slug);

  if (params.q?.trim()) {
    const q = params.q.trim().toLowerCase();
    list = list.filter(
      (c) => c.name.toLowerCase().includes(q) || c.cardNumber.toLowerCase().includes(q),
    );
  }

  if (params.status) {
    list = list.filter((c) => c.status === params.status);
  }

  const sortKey = (params.sort ?? 'number').toLowerCase();
  const sorted = [...list];
  sorted.sort((a, b) => compareCards(a, b, sortKey));
  return sorted;
}

function compareCards(a: Card, b: Card, sortKey: string): number {
  switch (sortKey) {
    case 'name':
      return (
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) ||
        a.cardNumber.localeCompare(b.cardNumber) ||
        a.foilType.localeCompare(b.foilType)
      );
    case 'status':
      return a.status.localeCompare(b.status) || a.cardNumber.localeCompare(b.cardNumber);
    case 'rarity':
      return (
        a.rarity.localeCompare(b.rarity, undefined, { sensitivity: 'base' }) ||
        a.cardNumber.localeCompare(b.cardNumber)
      );
    case 'foil':
      return (
        a.foilType.localeCompare(b.foilType, undefined, { sensitivity: 'base' }) ||
        a.cardNumber.localeCompare(b.cardNumber)
      );
    default:
      return (
        a.cardNumber.localeCompare(b.cardNumber, undefined, { numeric: true }) ||
        a.name.localeCompare(b.name) ||
        a.foilType.localeCompare(b.foilType)
      );
  }
}
