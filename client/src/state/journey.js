// The journey after an adventure is generated, as one explicit state machine.
// One `screen` value replaces scattered booleans, so impossible combinations cannot happen.

export const SCREENS = {
  HOME: 'home',
  ADVENTURE: 'adventure',
  COMMITMENT: 'commitment',
  CLOSING: 'closing',
  INTRO: 'intro',
  MISSION: 'mission',
  COMPLETE: 'complete',
};

export const initialJourney = {
  screen: SCREENS.HOME,
  adventure: null,
  model: null,
  missionIndex: 0,
  completedIds: [],
  skippedIds: [],
};

// Which actions are allowed on which screen. Anything else is ignored.
const ALLOWED = {
  [SCREENS.HOME]: ['generated'],
  [SCREENS.ADVENTURE]: ['restart', 'open-commitment'],
  [SCREENS.COMMITMENT]: ['back-to-adventure', 'confirm-going'],
  [SCREENS.CLOSING]: ['closing-done'],
  [SCREENS.INTRO]: ['begin', 'restart-missions', 'exit-phone-away'],
  [SCREENS.MISSION]: ['complete-mission', 'skip-mission', 'exit-phone-away'],
  [SCREENS.COMPLETE]: ['finish'],
};

export function hasProgress(state) {
  return state.missionIndex > 0 || state.completedIds.length > 0 || state.skippedIds.length > 0;
}

function advance(state, patch) {
  const total = state.adventure.missions.length;
  const next = { ...state, ...patch };
  if (state.missionIndex + 1 >= total) return { ...next, screen: SCREENS.COMPLETE };
  return { ...next, missionIndex: state.missionIndex + 1 };
}

export function journeyReducer(state, action) {
  if (!ALLOWED[state.screen]?.includes(action.type)) return state;

  switch (action.type) {
    case 'generated':
      return { ...initialJourney, screen: SCREENS.ADVENTURE, adventure: action.adventure, model: action.model };
    case 'restart':
    case 'finish':
      return initialJourney;
    case 'open-commitment':
      return { ...state, screen: SCREENS.COMMITMENT };
    case 'back-to-adventure':
    case 'exit-phone-away':
      return { ...state, screen: SCREENS.ADVENTURE };
    case 'confirm-going':
      return { ...state, screen: SCREENS.CLOSING };
    case 'closing-done':
      return { ...state, screen: SCREENS.INTRO };
    case 'begin':
      return { ...state, screen: SCREENS.MISSION };
    case 'restart-missions':
      return { ...state, screen: SCREENS.MISSION, missionIndex: 0, completedIds: [], skippedIds: [] };
    case 'complete-mission': {
      const id = state.adventure.missions[state.missionIndex].id;
      return advance(state, { completedIds: [...state.completedIds, id] });
    }
    case 'skip-mission': {
      const id = state.adventure.missions[state.missionIndex].id;
      return advance(state, { skippedIds: [...state.skippedIds, id] });
    }
    default:
      return state;
  }
}