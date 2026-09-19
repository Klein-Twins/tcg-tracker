import type { Card } from '../types';
import { resolveSetSlug } from './setNameResolver';

const CARD_NUMBER = /(\d{1,3}\/\d{1,3})/;

export function cardId(setSlug: string, cardNumber: string, foilType: string, name: string): string {
  return `${setSlug}::${cardNumber}::${foilType}::${name}`;
}

export function extractCardNumber(productName: string | null | undefined): string | null {
  if (!productName) return null;
  const match = CARD_NUMBER.exec(productName);
  return match ? match[1] : null;
}

export function mapFinishToFoil(finish: string | null | undefined): string | null {
  if (!finish?.trim()) return null;
  const normalized = finish.toLowerCase();
  if (normalized.includes('reverse')) return 'Reverse Holo';
  if (normalized.includes('holo')) return 'Holo';
  if (normalized.includes('non-foil') || normalized.includes('standard')) return 'Standard';
  return finish;
}

export function normalizeName(name: string | null | undefined): string {
  if (!name) return '';
  const withoutNumber = name.replace(CARD_NUMBER, '').trim();
  let base = withoutNumber.replace(/\s*-\s*$/, '');
  base = base.replace(/\([^)]*\)/g, '').trim();
  return base.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function numbersMatch(masterNumber: string, incomingNumber: string): boolean {
  if (masterNumber.toLowerCase() === incomingNumber.toLowerCase()) return true;
  const masterPrefix = masterNumber.split('/')[0];
  const incomingPrefix = incomingNumber.split('/')[0];
  return Boolean(masterPrefix && masterPrefix.toLowerCase() === incomingPrefix.toLowerCase());
}

export function matchCard(
  cardsBySet: Map<string, Card[]>,
  setName: string,
  productName: string,
  finish: string,
): Card | null {
  const slug = resolveSetSlug(setName);
  if (!slug) return null;
  const cards = cardsBySet.get(slug);
  if (!cards?.length) return null;

  const foil = mapFinishToFoil(finish);
  const cardNumber = extractCardNumber(productName);
  const normalizedName = normalizeName(productName);

  if (cardNumber) {
    const byNumberAndFoil = cards.find(
      (c) => numbersMatch(c.cardNumber, cardNumber) && (!foil || c.foilType.toLowerCase() === foil.toLowerCase()),
    );
    if (byNumberAndFoil) return byNumberAndFoil;

    const byNumber = cards.find((c) => numbersMatch(c.cardNumber, cardNumber));
    if (byNumber) return byNumber;
  }

  const byNameAndFoil = cards.find(
    (c) => normalizeName(c.name) === normalizedName && (!foil || c.foilType.toLowerCase() === foil.toLowerCase()),
  );
  if (byNameAndFoil) return byNameAndFoil;

  return cards.find((c) => normalizeName(c.name) === normalizedName) ?? null;
}

export function shouldUpdateStatus(current: Card['status'], incoming: Card['status']): boolean {
  if (incoming === 'OWNED') return current !== 'OWNED';
  if (incoming === 'ORDERED') return current === 'NEEDED';
  return false;
}
