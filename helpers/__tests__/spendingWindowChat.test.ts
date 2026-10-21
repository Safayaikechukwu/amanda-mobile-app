import assert from 'node:assert/strict';

import {
  buildSpendingWindowChatMessage,
  tryParseSpendingWindowRequest,
} from '../spendingWindowChat';

assert.equal(buildSpendingWindowChatMessage(7 * 60, 20 * 60), 'Set my spending window to 7 AM – 8 PM');

const parsed = tryParseSpendingWindowRequest('Change my spending window to 9 AM to 7 PM');
assert.ok(parsed);
assert.equal(parsed!.start, 9 * 60);
assert.equal(parsed!.end, 19 * 60);

const fromSave = tryParseSpendingWindowRequest('Set my spending window to 7:00 AM – 8:00 PM');
assert.ok(fromSave);
assert.equal(fromSave!.start, 7 * 60);
assert.equal(fromSave!.end, 20 * 60);

const rejected = tryParseSpendingWindowRequest('Change my spending window to 8 AM to 8:30 AM');
assert.equal(rejected, null);

console.log('spendingWindowChat tests passed');
