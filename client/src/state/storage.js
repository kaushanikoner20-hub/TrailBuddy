// Small browser-only persistence: the current adventure and Phone Away progress, plus optional reflections.
// Everything stays in this browser's localStorage. Nothing is sent anywhere.
import { SCREENS, hasProgress } from './journey.js';

const SESSION_KEY = 'trailbuddy.session.v1';
const REFLECTIONS_KEY = 'trailbuddy.reflections.v1';
const MAX_REFLECTIONS = 30;
const MOODS = ['calm', 'energized', 'clear-head', 'curious', 'creative'];
const ACTIVITIES = ['walk', 'explore', 'sit-outside', 'observe-nature', 'photography', 'surprise-me'];
const DIFFICULTIES = ['gentle', 'moderate', 'adventurous'];
const MISSION_TYPES = ['hearing', 'vision', 'touch', 'memory', 'curiosity', 'movement'];

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
    Number.isInteger(m.id) && m.id > 0 && typeof m.type === 'string' &&
    MISSION_TYPES.includes(m.type) &&
    typeof m.title === 'string' && m.title.trim().length > 0 && m.title.trim().length <= 60 &&
    typeof m.instruction === 'string' && m.instruction.trim().length > 0 && m.instruction.trim().length <= 400 &&
    Number.isInteger(m.duration) && m.duration > 0
  );
}

export function isAdventure(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const missions = value.missions;
  const ids = Array.isArray(missions) ? missions.map((mission) => mission?.id) : [];
  return Boolean(
    typeof value.title === 'string' && value.title.trim().length > 0 && value.title.trim().length <= 80 &&
    typeof value.tagline === 'string' && value.tagline.trim().length > 0 && value.tagline.trim().length <= 160 &&
    typeof value.intro === 'string' && value.intro.trim().length > 0 && value.intro.trim().length <= 300 &&
    typeof value.closing === 'string' && value.closing.trim().length > 0 && value.closing.trim().length <= 300 &&
    Number.isInteger(value.duration) && value.duration >= 10 && value.duration <= 240 &&
    MOODS.includes(value.mood) && ACTIVITIES.includes(value.activity) && DIFFICULTIES.includes(value.difficulty) &&
    Array.isArray(missions) && missions.length >= 3 && missions.length <= 7 && missions.every(isMission) &&
    new Set(ids).size === ids.length && missions.every((mission) => mission.duration <= value.duration) &&
    missions.reduce((sum, mission) => sum + mission.duration, 0) >= value.duration * 0.5 &&
    missions.reduce((sum, mission) => sum + mission.duration, 0) <= value.duration * 1.1
  );
}

/** Saves the session throughout the journey; clears it only after an explicit return home. */
export function saveSession(state, store = defaultStore()) {
  if (!store) return;
  try {
    const active = state.adventure && state.screen !== SCREENS.HOME;
    if (!active) {
      store.removeItem(SESSION_KEY);
      return;
    }
    const { adventure, model, missionIndex, completedIds, skippedIds } = state;
    store.setItem(SESSION_KEY, JSON.stringify({ v: 2, adventureId: state.adventureId, createdAt: state.createdAt,
      adventure, model, missionIndex, completedIds, skippedIds, prepared: state.prepared,
      workflowState: state.screen, reflection: state.reflection ?? '' }));
  } catch {
    // Storage full or blocked: the app still works, it just won't survive a reload.
  }
}

/** Returns a restored journey state, or null if nothing valid is saved. */
export function loadSession(store = defaultStore()) {
  if (!store) return null;
  try {
    const saved = JSON.parse(store.getItem(SESSION_KEY));
    if (!saved || ![1, 2].includes(saved.v) || !isAdventure(saved.adventure)) return null;

    const ids = saved.adventure.missions.map((m) => m.id);
    const validIds = (list) => Array.isArray(list) && list.every((id) => ids.includes(id));
    const total = saved.adventure.missions.length;
    if (!Number.isInteger(saved.missionIndex) || saved.missionIndex < 0 || saved.missionIndex >= total) return null;
    if (!validIds(saved.completedIds) || !validIds(saved.skippedIds)) return null;

    const state = {
      screen: SCREENS.ADVENTURE,
      adventure: saved.adventure,
      model: typeof saved.model === 'string' ? saved.model : null,
      adventureId: typeof saved.adventureId === 'string' ? saved.adventureId : `restored-${saved.createdAt ?? 'adventure'}`,
      createdAt: typeof saved.createdAt === 'string' && !Number.isNaN(Date.parse(saved.createdAt)) ? saved.createdAt : new Date(0).toISOString(),
      prepared: saved.prepared === true,
      reflection: typeof saved.reflection === 'string' ? saved.reflection.slice(0, 2000) : '',
      missionIndex: saved.missionIndex,
      completedIds: saved.completedIds,
      skippedIds: saved.skippedIds,
    };
    if (saved.v === 1) return hasProgress(state) ? { ...state, screen: SCREENS.INTRO } : state;
    if (saved.workflowState === SCREENS.COMPLETE) return { ...state, screen: SCREENS.COMPLETE };
    if (hasProgress(state)) return { ...state, screen: SCREENS.INTRO };
    const resumable = [SCREENS.ADVENTURE, SCREENS.COMMITMENT, SCREENS.CLOSING, SCREENS.INTRO, SCREENS.MISSION, SCREENS.COMPLETE];
    return resumable.includes(saved.workflowState) ? { ...state, screen: saved.workflowState } : state;
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
