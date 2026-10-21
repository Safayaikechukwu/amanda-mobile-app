import assert from 'node:assert/strict';

import { parseTextWithLinks } from '../linkify';

const parts = parseTextWithLinks('See https://paystack.com for details.');
assert.equal(parts.length, 3);
assert.deepEqual(parts[0], { type: 'text', value: 'See ' });
assert.equal(parts[1]?.type, 'link');
assert.equal((parts[1] as { url: string }).url, 'https://paystack.com');
assert.deepEqual(parts[2], { type: 'text', value: ' for details.' });

const www = parseTextWithLinks('Visit www.useudara.com today');
assert.equal(www[1]?.type, 'link');
assert.equal((www[1] as { url: string }).url, 'https://www.useudara.com');

assert.deepEqual(parseTextWithLinks('No links here'), [{ type: 'text', value: 'No links here' }]);

console.log('✓ openLink parsing tests passed');
