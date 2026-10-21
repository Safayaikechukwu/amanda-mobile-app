/** Default Android channel — must match helpers/notifications.ts */
export const NOTIFICATION_CHANNEL_ID = 'udara-default';

/** Payload `type` values used for deep-link routing when a notification is tapped. */
export const NotificationType = {
  home: 'home',
  savings: 'savings',
  insights: 'insights',
  bills: 'bills',
  profile: 'profile',
  transaction: 'transaction',
  savingsActivity: 'savings-activity',
} as const;

export type NotificationTypeValue = (typeof NotificationType)[keyof typeof NotificationType];

export type UdaraNotificationData = {
  type: NotificationTypeValue;
  id?: string;
  url?: string;
};
