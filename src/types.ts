export type Status = 'ORDERED' | 'OWNED' | 'NEEDED';

export interface SetSummary {
  slug: string;
  name: string;
  totalCards: number;
  ownedCount: number;
  orderedCount: number;
  neededCount: number;
  completionPercent: number;
}

export interface Card {
  id: string;
  setSlug: string;
  cardNumber: string;
  name: string;
  rarity: string;
  foilType: string;
  status: Status;
}

export interface ImportResult {
  rowsProcessed: number;
  cardsMatched: number;
  cardsUpdated: number;
  rowsSkipped: number;
}
