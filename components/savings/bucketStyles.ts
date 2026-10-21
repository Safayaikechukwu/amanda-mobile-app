import { StyleSheet } from 'react-native';

import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';

/** Vertical rhythm for all savings bucket screens. */
export const BUCKET_LAYOUT = {
  scrollTopPad: 14,
  heroBottomPad: 18,
  sectionGap: 10,
} as const;

/** Compact layout tokens shared across savings bucket screens. */
export const bucketStyles = StyleSheet.create({
  filterBlock: {
    gap: 8,
    marginTop: 2,
    alignSelf: 'stretch',
  },
  sectionHeading: {
    color: AppTheme.text,
    fontSize: 15,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.25,
    marginTop: 4,
    marginBottom: 2,
  },
  tableCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AppTheme.border,
  },
  tableInner: {
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 6,
  },
  tableHeaderLabel: {
    flex: 1,
    color: AppTheme.textFaint,
    fontSize: 10,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.35,
    textTransform: 'uppercase',
  },
  tableHeaderRight: {
    flex: 1.1,
  },
  tableHeaderAction: {
    width: 56,
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    gap: 6,
  },
  tableRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppTheme.border,
  },
  tableRowCustom: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: AppTheme.border,
  },
  tablePrimary: {
    flex: 1,
    fontSize: 14,
    fontFamily: FontFamily.bold,
  },
  tableSecondary: {
    flex: 1.1,
    color: AppTheme.text,
    fontSize: 13,
    fontFamily: FontFamily.semibold,
  },
  actionBtn: {
    minWidth: 52,
    alignSelf: 'center',
    borderRadius: 999,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: FontFamily.semibold,
  },
  saveBtn: {
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FontFamily.semibold,
  },
  listCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AppTheme.border,
  },
  listInner: {
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 2,
  },
  planIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planEmoji: {
    fontSize: 15,
  },
  planCopy: {
    flex: 1,
    gap: 1,
    minWidth: 0,
  },
  planTitle: {
    color: AppTheme.text,
    fontSize: 14,
    fontFamily: FontFamily.semibold,
  },
  planMeta: {
    color: AppTheme.textFaint,
    fontSize: 11,
    fontFamily: FontFamily.regular,
  },
  planMetaPending: {
    color: '#D97706',
    fontFamily: FontFamily.medium,
  },
  planAmount: {
    color: AppTheme.text,
    fontSize: 14,
    fontFamily: FontFamily.bold,
  },
  planAmountMuted: {
    color: AppTheme.textMuted,
  },
  planAmountPending: {
    color: '#D97706',
  },
  rowWrap: {
    paddingHorizontal: 2,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(13,13,13,0.08)',
  },
  empty: {
    color: AppTheme.textMuted,
    fontSize: 13,
    fontFamily: FontFamily.regular,
    padding: 12,
  },
  pressed: { opacity: 0.85 },
});
