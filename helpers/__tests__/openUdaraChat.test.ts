import assert from 'node:assert/strict';

import { consumePendingChatMessage, setPendingChatMessage } from '../openUdaraChat';

function testPendingMessageQueue() {
  assert.equal(consumePendingChatMessage(), null);

  setPendingChatMessage('I want to add money');
  assert.equal(consumePendingChatMessage(), 'I want to add money');
  assert.equal(consumePendingChatMessage(), null);
}

testPendingMessageQueue();
console.log('openUdaraChat: ok');
