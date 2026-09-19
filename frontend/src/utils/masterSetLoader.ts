import * as XLSX from 'xlsx';
import { FILE_SLUG, MASTER_SET_FILES } from '../data/masterSetManifest';
import type { Card, Status } from '../types';
import { cardId } from './cardMatching';
import { displayNameFromSlug } from './setNameResolver';

export interface LoadedMasterData {
  setNames: Map<string, string>;
  cards: Card[];
}

function cellStr(row: unknown[], index: number): string {
  const v = row[index];
  if (v == null) return '';
  return String(v).trim();
}

function parseWorkbook(slug: string, buffer: ArrayBuffer, statusOverrides: Record<string, Status>): Card[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' });
  const cards: Card[] = [];
  let headerSkipped = false;

  for (const row of rows) {
    if (!Array.isArray(row)) continue;
    const owned = cellStr(row, 0);
    const cardNumber = cellStr(row, 1);
    const cardName = cellStr(row, 2);
    const rarity = cellStr(row, 3);
    const foil = cellStr(row, 4);

    if (!headerSkipped) {
      headerSkipped = true;
      if (cardNumber.toLowerCase() === 'card #' || owned.toLowerCase() === 'owned') {
        continue;
      }
    }
    if (!cardNumber || !cardName || !foil) continue;

    const id = cardId(slug, cardNumber, foil, cardName);
    cards.push({
      id,
      setSlug: slug,
      cardNumber,
      name: cardName,
      rarity,
      foilType: foil,
      status: statusOverrides[id] ?? 'NEEDED',
    });
  }
  return cards;
}

export async function loadAllMasterSets(statusOverrides: Record<string, Status>): Promise<LoadedMasterData> {
  const setNames = new Map<string, string>();
  const cards: Card[] = [];

  for (const filename of MASTER_SET_FILES) {
    const match = FILE_SLUG.exec(filename);
    if (!match) continue;
    const slug = match[1];
    setNames.set(slug, displayNameFromSlug(slug));

    const response = await fetch(`/masterset-cards/${encodeURIComponent(filename)}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`);
    }
    const buffer = await response.arrayBuffer();
    cards.push(...parseWorkbook(slug, buffer, statusOverrides));
  }

  return { setNames, cards };
}
