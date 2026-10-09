// Small browser-only persistence: the current adventure and Phone Away progress, plus optional reflections.
// Everything stays in this browser's localStorage. Nothing is sent anywhere.
import { SCREENS, hasProgress } from './journey.js';

const SESSION_KEY = 'trailbuddy.session.v1';
const REFLECTIONS_KEY = 'trailbuddy.reflections.v1';
const MAX_REFLECTIONS = 30;

function defaultStore() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isMission(m) {
  return Boolean(
    m && typeof m === 'object' &&
    Number.isInteger(m.id) && typeof m.type === 'string' &&
    typeof m.title === 'string' && typeof m.instruction === 'string' &&
    Number.isInteger(m.duration) && m.duration > 0
  );
}

export function isAdventure(value) {
  return Boolean(
    value && typeof value === 'object' &&
    typeof value.title === 'string' && typeof value.tagline === 'string' &&
    typeof value.intro === 'string' && typeof value.closing === 'string' &&
    Number.isInteger(value.duration) &&
    Array.isArray(value.missions) && value.missions.length > 0 && value.missions.every(isMission)
  );
}

/** Saves the session while an adventure is in play; clears it on home and after completion. */
export function saveSession(state, store = defaultStore()) {
  if (!store) return;
  try {
    const active = state.adventure && state.screen !== SCREENS.HOME && state.screen !== SCREENS.COMPLETE;
    if (!active) {
      store.removeItem(SESSION_KEY);
      return;
    }
    const { adventure, model, missionIndex, completedIds, skippedIds } = state;
    store.setItem(SESSION_KEY, JSON.stringify({ v: 1, adventure, model, missionIndex, completedIds, skippedIds }));
  } catch {
    // Storage full or blocked: the app still works, it just won't survive a reload.
  }
}

/** Returns a restored journey state, or null if nothing valid is saved. */
export function loadSession(store = defaultStore()) {
  if (!store) return null;
  try {
    const saved = JSON.parse(store.getItem(SESSION_KEY));
    if (!saved || saved.v !== 1 || !isAdventure(saved.adventure)) return null;

    const ids = saved.adventure.missions.map((m) => m.id);
    const validIds = (list) => Array.isArray(list) && list.every((id) => ids.includes(id));
    const total = saved.adventure.missions.length;
    if (!Number.isInteger(saved.missionIndex) || saved.missionIndex < 0 || saved.missionIndex >= total) return null;
    if (!validIds(saved.completedIds) || !validIds(saved.skippedIds)) return null;

    const state = {
      screen: SCREENS.ADVENTURE,
      adventure: saved.adventure,
      model: typeof saved.model === 'string' ? saved.model : null,
      missionIndex: saved.missionIndex,
      completedIds: saved.completedIds,
      skippedIds: saved.skippedIds,
    };
    return hasProgress(state) ? { ...state, screen: SCREENS.INTRO } : state;
  } catch {
    return null;
  }
}

export function saveReflection({ title, text }, store = defaultStore()) {
  const trimmed = typeof text === 'string' ? text.trim() : '';
  if (!store || !trimmed) return false;
  try {
    const existing = JSON.parse(store.getItem(REFLECTIONS_KEY)) ?? [];
    const list = Array.isArray(existing) ? existing : [];
    list.push({ savedAt: new Date().toISOString(), title: String(title ?? ''), text: trimmed.slice(0, 2000) });
    store.setItem(REFLECTIONS_KEY, JSON.stringify(list.slice(-MAX_REFLECTIONS)));
    return true;
  } catch {
    return false;
  }
}