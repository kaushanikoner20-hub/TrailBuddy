import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SCREENS, initialJourney } from './journey.js';
import { isAdventure, loadSession, saveReflection, saveSession } from './storage.js';

function fakeStore() {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
    data,
  };
}

const adventure = {
  title: 'T', tagline: 't', intro: 'i', closing: 'c', duration: 30,
  mood: 'calm', activity: 'walk', difficulty: 'gentle', phone_free: true,
  missions: [1, 2, 3].map((id) => ({ id, type: 'hearing', title: 'M', instruction: 'x', duration: 5 })),
};
const active = { ...initialJourney, screen: SCREENS.ADVENTURE, adventure, model: 'gemma3:4b' };

test('isAdventure accepts a valid adventure and rejects broken ones', () => {
  assert.equal(isAdventure(adventure), true);
  assert.equal(isAdventure(null), false);
  assert.equal(isAdventure({ ...adventure, missions: [] }), false);
  assert.equal(isAdventure({ ...adventure, missions: [{ id: 1 }] }), false);
  assert.equal(isAdventure({ ...adventure, mood: 'unknown' }), false);
  assert.equal(isAdventure({ ...adventure, missions: [adventure.missions[0], adventure.missions[0], adventure.missions[2]] }), false);
});

test('a saved adventure without progress is restored to the adventure screen', () => {
  const store = fakeStore();
  saveSession(active, store);
  const restored = loadSession(store);
  assert.equal(restored.screen, SCREENS.ADVENTURE);
  assert.deepEqual(restored.adventure, adventure);
});

test('saved progress is restored to the Phone Away intro so the user can resume', () => {
  const store = fakeStore();
  saveSession({ ...active, screen: SCREENS.MISSION, missionIndex: 1, completedIds: [1] }, store);
  const restored = loadSession(store);
  assert.equal(restored.screen, SCREENS.INTRO);
  assert.equal(restored.missionIndex, 1);
  assert.deepEqual(restored.completedIds, [1]);
});

test('completion remains restorable and an explicit return home clears the saved session', () => {
  const store = fakeStore();
  saveSession(active, store);
  saveSession(initialJourney, store);
  assert.equal(loadSession(store), null);
  saveSession(active, store);
  saveSession({ ...active, screen: SCREENS.COMPLETE }, store);
  assert.equal(loadSession(store).screen, SCREENS.COMPLETE);
  saveSession(initialJourney, store);
  assert.equal(loadSession(store), null);
});

test('prepared state and workflow state survive a refresh', () => {
  const store = fakeStore();
  saveSession({ ...active, adventureId: 'local-1', createdAt: '2026-10-09T10:00:00.000Z', prepared: true, screen: SCREENS.COMMITMENT }, store);
  const restored = loadSession(store);
  assert.equal(restored.adventureId, 'local-1');
  assert.equal(restored.createdAt, '2026-10-09T10:00:00.000Z');
  assert.equal(restored.prepared, true);
  assert.equal(restored.screen, SCREENS.COMMITMENT);
});

test('corrupt or tampered data is ignored', () => {
  const store = fakeStore();
  store.setItem('trailbuddy.session.v1', 'not json');
  assert.equal(loadSession(store), null);
  store.setItem('trailbuddy.session.v1', JSON.stringify({ v: 1, adventure, missionIndex: 9, completedIds: [], skippedIds: [] }));
  assert.equal(loadSession(store), null);
  store.setItem('trailbuddy.session.v1', JSON.stringify({ v: 1, adventure, missionIndex: 0, completedIds: [99], skippedIds: [] }));
  assert.equal(loadSession(store), null);
});

test('missing storage never throws', () => {
  assert.doesNotThrow(() => saveSession(active, null));
  assert.equal(loadSession(null), null);
  assert.equal(saveReflection({ title: 'T', text: 'hello' }, null), false);
});

test('reflections are saved locally, trimmed, and capped; empty ones are not saved', () => {
  const store = fakeStore();
  assert.equal(saveReflection({ title: 'T', text: '   ' }, store), false);
  for (let i = 0; i < 35; i += 1) assert.equal(saveReflection({ title: 'T', text: `note ${i}` }, store), true);
  const list = JSON.parse(store.getItem('trailbuddy.reflections.v1'));
  assert.equal(list.length, 30);
  assert.equal(list.at(-1).text, 'note 34');
});
