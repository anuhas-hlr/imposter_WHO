// ─── PALETTE ──────────────────────────────────────────────────────────────────
export const Colors = {
  // Backgrounds
  bgWarm: '#FFF9E6',
  bgCard: '#FFFFFF',

  // Brand / Candy Accents
  mint: '#6BCB77',
  mintDark: '#4AA854',
  sky: '#4D96FF',
  skyDark: '#1F6FD4',
  coral: '#FF6B6B',
  coralDark: '#D44040',
  gold: '#FFD93D',
  goldDark: '#D4A800',
  violet: '#C77DFF',
  violetDark: '#8A2BE2',
  orange: '#FF9F43',
  orangeDark: '#E07C10',

  // Neutrals
  dark: '#1E272E',
  darkMid: '#2F3640',
  slate: '#576574',
  muted: '#8395A7',
  border: '#1E272E',

  // Player Avatars
  civilian: '#D0EEFF',
  civilianBorder: '#4D96FF',
  imposter: '#FFD6D6',
  imposterBorder: '#FF6B6B',
};

// ─── BORDER / SHADOW ───────────────────────────────────────────────────────────
export const Borders = {
  width: 3,
  radius: 22,
  radiusSm: 14,
  radiusLg: 28,
  radiusFull: 999,
};

// Hard 5px drop shadow (no blur)
export const makeHardShadow = (color: string = Colors.dark, offset = 5) => ({
  // React Native doesn't support boxShadow natively, but for expo-web this will be overridden.
  // On native we emulate with borderBottom / borderRight.
  shadowColor: color,
  shadowOffset: { width: offset, height: offset },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: offset,
});

// ─── PLAYER AVATARS MAP ────────────────────────────────────────────────────────
export const PLAYER_AVATARS = [
  '🐱', '🦊', '🐸', '🐼', '🐨', '🐰', '🦋', '🐻',
  '🦁', '🐯', '🐧', '🦉', '🐹', '🦄', '🐮', '🦔',
  '🦊', '🐺', '🐙', '🦈',
];

export const AVATAR_COLORS = [
  { bg: '#FFF0A0', border: '#FFD93D' },
  { bg: '#FFD6D6', border: '#FF6B6B' },
  { bg: '#D6FFE2', border: '#6BCB77' },
  { bg: '#D0EEFF', border: '#4D96FF' },
  { bg: '#EDD6FF', border: '#C77DFF' },
  { bg: '#FFE4CC', border: '#FF9F43' },
  { bg: '#FFDFF2', border: '#FF6BB5' },
  { bg: '#D6F5FF', border: '#30C3E3' },
];
