import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractJson } from './modelJson.js';

test('parses clean JSON', () => {
  assert.deepEqual(extractJson('{"a":1}'), { a: 1 });
});

test('parses JSON inside markdown fences', () => {
  assert.deepEqual(extractJson('```json\n{"a":1}\n```'), { a: 1 });
});

test('parses JSON surrounded by extra words', () => {
  assert.deepEqual(extractJson('Here you go:\n{"a":{"b":2}}\nEnjoy!'), { a: { b: 2 } });
});

test('returns null for malformed or non-object output', () => {
  for (const text of ['{"a":', 'no json here', '', '42', '"string"', null, undefined]) {
    assert.equal(extractJson(text), null, String(text));
  }
});