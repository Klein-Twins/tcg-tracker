import Papa from 'papaparse';
import type { Card, ImportResult, Status } from '../types';
import { matchCard, shouldUpdateStatus } from './cardMatching';

function firstPresent(row: Record<string, string>, candidates: string[]): string {
  const keys = Object.keys(row);
  for (const candidate of candidates) {
    const key = keys.find((k) => k.toLowerCase() === candidate.toLowerCase());
    if (key && row[key]?.trim()) return row[key].trim();
  }
  return '';
}

function isCanceled(row: Record<string, string>): boolean {
  const shippingStatus = firstPresent(row, ['Shipping Status', 'Status']);
  return shippingStatus.toLowerCase().includes('cancel');
}

function parseCsvText(text: string): Record<string, string>[] {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  if (result.errors.length) {
    throw new Error(result.errors[0]?.message ?? 'CSV parse error');
  }
  return result.data;
}

export function importCsvRows(
  csvText: string,
  targetStatus: Status,
  cardsBySet: Map<string, Card[]>,
  skipCanceled: boolean,
): { result: ImportResult; updatedCards: Map<string, Status> } {
  const rows = parseCsvText(csvText);
  let processed = 0;
  let matched = 0;
  let updated = 0;
  let skipped = 0;
  const updatedCards = new Map<string, Status>();

  for (const row of rows) {
    processed++;
    if (skipCanceled && isCanceled(row)) {
      skipped++;
      continue;
    }

    const setName = firstPresent(row, ['Set Name', 'Set', 'SetName']);
    const productName = firstPresent(row, ['Product Name', 'Card Name', 'ProductName', 'Name']);
    const finish = firstPresent(row, ['Finish', 'Foil', 'Variant', 'Printing', 'Variance']);

    if (!setName || !productName) {
      skipped++;
      continue;
    }

    const card = matchCard(cardsBySet, setName, productName, finish);
    if (!card) {
      skipped++;
      continue;
    }
    matched++;

    const nextStatus = updatedCards.get(card.id) ?? card.status;
    if (shouldUpdateStatus(nextStatus, targetStatus)) {
      updatedCards.set(card.id, targetStatus);
      updated++;
    }
  }

  return {
    result: { rowsProcessed: processed, cardsMatched: matched, cardsUpdated: updated, rowsSkipped: skipped },
    updatedCards,
  };
}
