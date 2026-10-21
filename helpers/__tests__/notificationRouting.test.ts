import assert from 'node:assert/strict';

import { NotificationType } from '../../constants/NotificationTypes';
import { isUdaraNotificationData, routeFromNotificationData } from '../notificationRouting';

function testRoute(type: string, id?: string, expected?: string | null) {
  const href = routeFromNotificationData({ type, ...(id ? { id } : {}) });
  assert.equal(href, expected ?? null, `route for ${type}${id ? `/${id}` : ''}`);
}

// Deep-link routing
testRoute(NotificationType.home, undefined, '/(app)');
testRoute(NotificationType.savings, undefined, '/(app)/savings');
testRoute(NotificationType.insights, undefined, '/(app)/insights');
testRoute(NotificationType.bills, undefined, '/(app)/bills');
testRoute(NotificationType.profile, undefined, '/(app)/profile');
testRoute(NotificationType.transaction, 'tx-1', '/(app)/transaction/tx-1');
testRoute(NotificationType.savingsActivity, 'gb1', '/(app)/savings/activity/gb1');
testRoute(NotificationType.transaction, undefined, null);
testRoute('unknown-type', undefined, null);
assert.equal(routeFromNotificationData(null), null);
assert.equal(routeFromNotificationData(undefined), null);

// Payload guard
assert.equal(isUdaraNotificationData({ type: NotificationType.home }), true);
assert.equal(isUdaraNotificationData({ type: 'nope' }), false);
assert.equal(isUdaraNotificationData(null), false);

console.log('✓ notification routing tests passed (10 cases)');
