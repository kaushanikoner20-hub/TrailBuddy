import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateAdventureRequest } from './validation.js';

const valid = { activity: 'walking', duration: 30, difficulty: 'relaxed' };

test('accepts a valid request', () => {
  assert.deepEqual(validateAdventureRequest(valid).value, valid);
});

test('normalizes case and whitespace in text fields', () => {
  const { value } = validateAdventureRequest({ ...valid, activity: ' Walking ', difficulty: 'RELAXED' });
  assert.equal(value.activity, 'walking');
  assert.equal(value.difficulty, 'relaxed');
});

test('rejects unknown activity', () => {
  assert.ok(validateAdventureRequest({ ...valid, activity: 'skydiving' }).errors);
});

test('rejects unknown difficulty', () => {
  assert.ok(validateAdventureRequest({ ...valid, difficulty: 'insane' }).errors);
});

test('rejects non-integer, out-of-range, and string durations', () => {
  for (const duration of [5, 241, 30.5, '30', null, undefined]) {
    assert.ok(validateAdventureRequest({ ...valid, duration }).errors, `duration ${duration}`);
  }
});

test('rejects missing or non-object bodies', () => {
  for (const body of [undefined, null, 'text', 42, {}]) {
    assert.ok(validateAdventureRequest(body).errors);
  }
});

test('reports every invalid field at once', () => {
  assert.equal(validateAdventureRequest({}).errors.length, 3);
});