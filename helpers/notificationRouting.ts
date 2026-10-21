import type { UdaraNotificationData } from '@/constants/NotificationTypes';
import { NotificationType } from '@/constants/NotificationTypes';

/** Map notification payload → Expo Router href. Returns null if unknown. */
export function routeFromNotificationData(
  data: Record<string, unknown> | undefined | null,
): string | null {
  if (!data || typeof data !== 'object') return null;

  const type = data.type;
  const id = typeof data.id === 'string' ? data.id : undefined;

  switch (type) {
    case NotificationType.home:
      return '/(app)';
    case NotificationType.savings:
      return '/(app)/savings';
    case NotificationType.insights:
      return '/(app)/insights';
    case NotificationType.bills:
      return '/(app)/bills';
    case NotificationType.profile:
      return '/(app)/profile';
    case NotificationType.transaction:
      return id ? `/(app)/transaction/${id}` : null;
    case NotificationType.savingsActivity:
      return id ? `/(app)/savings/activity/${id}` : null;
    default:
      return null;
  }
}

export function isUdaraNotificationData(data: unknown): data is UdaraNotificationData {
  if (!data || typeof data !== 'object') return false;
  const type = (data as UdaraNotificationData).type;
  return typeof type === 'string' && (Object.values(NotificationType) as string[]).includes(type);
}
