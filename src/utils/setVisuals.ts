const SET_COLORS: Record<string, string> = {
  '151': '#e85d4c',
  'SCARLET-VIOLET': '#c62828',
  'PALDEA-EVOLVED': '#2e7d32',
  'OBSIDIAN-FLAMES': '#ef6c00',
  'PARADOX-RIFT': '#6a1b9a',
  'TEMPORAL-FORCES': '#00838f',
  'TWILIGHT-MASQUERADE': '#ad1457',
  'STELLAR-CROWN': '#4527a0',
  'SURGING-SPARKS': '#f9a825',
  'JOURNEY-TOGETHER': '#1565c0',
  'DESTINED-RIVALS': '#37474f',
  'PALDEAN-FATES': '#7b1fa2',
  'PRISMATIC-EVOLUTIONS': '#00897b',
  'BLACK-BOLT': '#212121',
  'WHITE-FLARE': '#eceff1',
  'SHROUDED-FABLE': '#4e342e',
};

export function setAccent(slug: string): string {
  return SET_COLORS[slug] ?? '#455a64';
}

export function setBadge(slug: string): string {
  if (slug === '151') return '151';
  const parts = slug.split('-').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 3);
  return parts.map((p) => p[0]).join('').slice(0, 4);
}
