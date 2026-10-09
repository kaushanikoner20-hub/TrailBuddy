import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTimer, elapsedAt, formatClock, pauseTimer, readStoredTimer, remainingAt, startTimer, writeStoredTimer } from './timerModel.js';

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

test('running timer state restores from timestamps and a paused timer stays frozen', () => {
  const data = new Map();
  const store = { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  const running = startTimer(createTimer(FIVE_MIN), 1000);
  assert.equal(writeStoredTimer(store, 'running', 'running', running), true);
  const restoredRunning = readStoredTimer(store, 'running', FIVE_MIN);
  assert.equal(remainingAt(restoredRunning.timer, 121_000), 3 * 60_000);

  const paused = pauseTimer(running, 61_000);
  writeStoredTimer(store, 'paused', 'paused', paused);
  const restoredPaused = readStoredTimer(store, 'paused', FIVE_MIN);
  assert.equal(remainingAt(restoredPaused.timer, 10_000_000), 4 * 60_000);
});

test('corrupt, mismatched, and unavailable timer storage restore safely', () => {
  const store = { getItem: () => '{bad', setItem: () => { throw new Error('blocked'); } };
  assert.equal(readStoredTimer(store, 'timer', FIVE_MIN), null);
  assert.equal(readStoredTimer({ getItem: () => JSON.stringify({ v: 1, status: 'running', timer: createTimer(10) }) }, 'x', FIVE_MIN), null);
  assert.equal(writeStoredTimer(store, 'x', 'running', createTimer(FIVE_MIN)), false);
  assert.equal(readStoredTimer(null, 'x', FIVE_MIN), null);
});
