import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTimer, elapsedAt, formatClock, pauseTimer, remainingAt, startTimer } from './timerModel.js';

const FIVE_MIN = 5 * 60 * 1000;

test('a new timer has the full duration remaining and does not run by itself', () => {
  const t = createTimer(FIVE_MIN);
  assert.equal(remainingAt(t, 1_000_000), FIVE_MIN);
});

test('remaining time comes from timestamps, so a suspended page does not drift', () => {
  const t = startTimer(createTimer(FIVE_MIN), 1000);
  assert.equal(remainingAt(t, 1000 + 2 * 60 * 1000), 3 * 60 * 1000);
});

test('pause freezes time and resume continues from there', () => {
  let t = startTimer(createTimer(FIVE_MIN), 0);
  t = pauseTimer(t, 60_000);
  assert.equal(remainingAt(t, 10 * 60_000), 4 * 60_000);
  t = startTimer(t, 20 * 60_000);
  assert.equal(remainingAt(t, 20 * 60_000 + 30_000), 3.5 * 60_000);
});

test('elapsed time never exceeds the duration', () => {
  const t = startTimer(createTimer(FIVE_MIN), 0);
  assert.equal(elapsedAt(t, 99 * 60_000), FIVE_MIN);
  assert.equal(remainingAt(t, 99 * 60_000), 0);
});

test('starting twice and pausing a stopped timer change nothing', () => {
  const started = startTimer(createTimer(FIVE_MIN), 100);
  assert.equal(startTimer(started, 999), started);
  const idle = createTimer(FIVE_MIN);
  assert.equal(pauseTimer(idle, 999), idle);
});

test('formatClock rounds up to whole seconds', () => {
  assert.equal(formatClock(FIVE_MIN), '5:00');
  assert.equal(formatClock(59_001), '1:00');
  assert.equal(formatClock(1), '0:01');
  assert.equal(formatClock(0), '0:00');
  assert.equal(formatClock(-5), '0:00');
});