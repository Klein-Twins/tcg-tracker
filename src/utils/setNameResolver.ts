const ALIASES = new Map<string, string>();

function alias(externalName: string, slug: string) {
  ALIASES.set(normalize(externalName), slug);
}

alias('151', '151');
alias('SV: 151', '151');
alias('SV01: Scarlet & Violet Base Set', 'SCARLET-VIOLET');
alias('SV01: Scarlet & Violet', 'SCARLET-VIOLET');
alias('SV02: Paldea Evolved', 'PALDEA-EVOLVED');
alias('SV03: Obsidian Flames', 'OBSIDIAN-FLAMES');
alias('SV04: Paradox Rift', 'PARADOX-RIFT');
alias('SV05: Temporal Forces', 'TEMPORAL-FORCES');
alias('SV06: Twilight Masquerade', 'TWILIGHT-MASQUERADE');
alias('SV07: Stellar Crown', 'STELLAR-CROWN');
alias('SV08: Surging Sparks', 'SURGING-SPARKS');
alias('SV09: Journey Together', 'JOURNEY-TOGETHER');
alias('SV10: Destined Rivals', 'DESTINED-RIVALS');
alias('SV: Paldean Fates', 'PALDEAN-FATES');
alias('SV: Prismatic Evolutions', 'PRISMATIC-EVOLUTIONS');
alias('SWSH: Black Bolt', 'BLACK-BOLT');
alias('SWSH: White Flare', 'WHITE-FLARE');
alias('SV: Shrouded Fable', 'SHROUDED-FABLE');

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

export function resolveSetSlug(setName: string | null | undefined): string | null {
  if (!setName?.trim()) return null;
  const decoded = setName.replace(/&amp;/g, '&').trim();
  const normalized = normalize(decoded);
  if (ALIASES.has(normalized)) {
    return ALIASES.get(normalized)!;
  }
  for (const [key, slug] of ALIASES) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return slug;
    }
  }
  return decoded
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function displayNameFromSlug(slug: string): string {
  const names: Record<string, string> = {
    '151': '151',
    'SCARLET-VIOLET': 'Scarlet & Violet',
    'PALDEA-EVOLVED': 'Paldea Evolved',
    'OBSIDIAN-FLAMES': 'Obsidian Flames',
    'PARADOX-RIFT': 'Paradox Rift',
    'TEMPORAL-FORCES': 'Temporal Forces',
    'TWILIGHT-MASQUERADE': 'Twilight Masquerade',
    'STELLAR-CROWN': 'Stellar Crown',
    'SURGING-SPARKS': 'Surging Sparks',
    'JOURNEY-TOGETHER': 'Journey Together',
    'DESTINED-RIVALS': 'Destined Rivals',
    'PALDEAN-FATES': 'Paldean Fates',
    'PRISMATIC-EVOLUTIONS': 'Prismatic Evolutions',
    'BLACK-BOLT': 'Black Bolt',
    'WHITE-FLARE': 'White Flare',
    'SHROUDED-FABLE': 'Shrouded Fable',
  };
  return names[slug] ?? slug.replace(/-/g, ' ');
}
