import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateAdventureRequest } from './adventureRequest.js';

const valid = { mood: 'calm', duration: 30, activity: 'walk', difficulty: 'gentle' };

test('accepts a valid request', () => {
  assert.deepEqual(validateAdventureRequest(valid).value, valid);
});

test('normalizes case and whitespace', () => {
  const { value } = validateAdventureRequest({ ...valid, mood: ' Calm ', activity: 'WALK' });
  assert.equal(value.mood, 'calm');
  assert.equal(value.activity, 'walk');
});

test('accepts every documented option', () => {
  for (const mood of ['calm', 'energized', 'clear-head', 'curious', 'creative']) {
    assert.ok(validateAdventureRequest({ ...valid, mood }).value, mood);
  }
  for (const activity of ['walk', 'explore', 'sit-outside', 'observe-nature', 'photography', 'surprise-me']) {
    assert.ok(validateAdventureRequest({ ...valid, activity }).value, activity);
  }
  for (const difficulty of ['gentle', 'moderate', 'adventurous']) {
    assert.ok(validateAdventureRequest({ ...valid, difficulty }).value, difficulty);
  }
});

test('still accepts Stage 1 activity and difficulty words', () => {
  const { value } = validateAdventureRequest({ ...valid, activity: 'walking', difficulty: 'relaxed' });
  assert.equal(value.activity, 'walk');
  assert.equal(value.difficulty, 'gentle');
});

test('rejects a missing mood', () => {
  const { mood, ...withoutMood } = valid;
  const result = validateAdventureRequest(withoutMood);
  assert.ok(result.errors.some((e) => e.startsWith('mood')));
});

test('rejects invalid mood, activity, and difficulty', () => {
  assert.ok(validateAdventureRequest({ ...valid, mood: 'angry' }).errors);
  assert.ok(validateAdventureRequest({ ...valid, activity: 'skydiving' }).errors);
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
  assert.equal(validateAdventureRequest({}).errors.length, 4);
});