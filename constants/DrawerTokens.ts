/**
 * ChatGPT drawer spacing tokens — white theme.
 * Keep these locked; tweak here only for pixel passes.
 */
export const DrawerTokens = {
  /** ~84% width so home peeks ~16% like ChatGPT */
  widthRatio: 0.84,
  widthMax: 400,

  headerPadH: 20,
  headerPadBottom: 16,
  listPadH: 12,
  footerPadH: 20,
  footerPadTop: 12,
  footerPadBottomMin: 14,

  brandSize: 23,
  brandTracking: -0.5,

  iconWell: 38,
  iconWellBg: '#f2f2f2',

  rowPadV: 11,
  rowPadH: 10,
  rowRadius: 14,
  rowActiveBg: '#ebebeb',

  iconSize: 22,
  iconCol: 26,
  iconToLabel: 14,

  navLabelSize: 16,
  recentLabelSize: 15,
  sectionTitleSize: 13,

  recentsTitleTop: 28,
  recentsTitleBottom: 6,

  homePillBg: '#007AFF',
  homePillPadH: 20,
  homePillPadV: 12,
  homePillRadius: 24,
  unreadDot: '#007AFF',

  /** Pushed scene */
  peekMarginV: 14,
  peekRadius: 38,
  peekDim: 'rgba(0,0,0,0.5)',
  rootBackdrop: '#e0e0e0',
} as const;
