import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SCREENS, initialJourney, journeyReducer, hasProgress } from './journey.js';

const adventure = {
  title: 'T', tagline: 't', intro: 'i', closing: 'c', duration: 30,
  missions: [1, 2, 3].map((id) => ({ id, type: 'vision', title: `M${id}`, instruction: 'x', duration: 5 })),
};

const run = (state, ...types) => types.reduce((s, type) => journeyReducer(s, typeof type === 'string' ? { type } : type), state);
const ready = () => run(initialJourney, { type: 'generated', adventure, model: 'gemma3:4b' });

test('generating an adventure moves home to the adventure screen and keeps the adventure', () => {
  const s = ready();
  assert.equal(s.screen, SCREENS.ADVENTURE);
  assert.equal(s.adventure, adventure);
  assert.equal(s.model, 'gemma3:4b');
});

test('the full happy path reaches the completion screen', () => {
  let s = run(ready(), 'open-commitment', 'confirm-going', 'closing-done', 'begin');
  assert.equal(s.screen, SCREENS.MISSION);
  s = run(s, 'complete-mission', 'skip-mission', 'complete-mission');
  assert.equal(s.screen, SCREENS.COMPLETE);
  assert.deepEqual(s.completedIds, [1, 3]);
  assert.deepEqual(s.skippedIds, [2]);
});

test('actions that do not belong to the current screen are ignored', () => {
  const s = ready();
  assert.equal(journeyReducer(s, { type: 'confirm-going' }), s);
  assert.equal(journeyReducer(s, { type: 'complete-mission' }), s);
  assert.equal(journeyReducer(initialJourney, { type: 'begin' }), initialJourney);
});

test('declining on the commitment screen returns to the same adventure without regenerating', () => {
  const s = run(ready(), 'open-commitment', 'back-to-adventure');
  assert.equal(s.screen, SCREENS.ADVENTURE);
  assert.equal(s.adventure, adventure);
});

test('exiting Phone Away Mode keeps progress so it can be resumed', () => {
  let s = run(ready(), 'open-commitment', 'confirm-going', 'closing-done', 'begin', 'complete-mission', 'exit-phone-away');
  assert.equal(s.screen, SCREENS.ADVENTURE);
  assert.equal(hasProgress(s), true);
  s = run(s, 'open-commitment', 'confirm-going', 'closing-done');
  assert.equal(s.screen, SCREENS.INTRO);
  s = run(s, 'begin');
  assert.equal(s.missionIndex, 1);
});

test('restart-missions clears progress', () => {
  const s = run(ready(), 'open-commitment', 'confirm-going', 'closing-done', 'begin', 'complete-mission', 'exit-phone-away',
    'open-commitment', 'confirm-going', 'closing-done', 'restart-missions');
  assert.equal(s.screen, SCREENS.MISSION);
  assert.equal(s.missionIndex, 0);
  assert.deepEqual(s.completedIds, []);
});

test('finish and restart return to a clean home state', () => {
  const done = run(ready(), 'open-commitment', 'confirm-going', 'closing-done', 'begin', 'skip-mission', 'skip-mission', 'skip-mission', 'finish');
  assert.deepEqual(done, initialJourney);
  assert.deepEqual(run(ready(), 'restart'), initialJourney);
});