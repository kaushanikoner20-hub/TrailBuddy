export const MOODS = ['calm', 'energized', 'clear-head', 'curious', 'creative'];
export const ACTIVITIES = ['walk', 'explore', 'sit-outside', 'observe-nature', 'photography', 'surprise-me'];
export const DIFFICULTIES = ['gentle', 'moderate', 'adventurous'];
export const MIN_DURATION = 10;
export const MAX_DURATION = 240;

// Stage 1 used different words for activity and difficulty. They are still accepted.
const ACTIVITY_ALIASES = {
  walking: 'walk',
  hiking: 'explore',
  running: 'explore',
  cycling: 'explore',
};
const DIFFICULTY_ALIASES = {
  relaxed: 'gentle',
  challenging: 'adventurous',
};

function normalizeChoice(value, allowed, aliases = {}) {
  if (typeof value !== 'string') return null;
  const key = value.trim().toLowerCase();
  const resolved = aliases[key] ?? key;
  return allowed.includes(resolved) ? resolved : null;
}

/**
 * Validates an adventure request body.
 * Returns { value } with normalized input, or { errors } with readable messages.
 */
export function validateAdventureRequest(body) {
  const errors = [];
  const input = body && typeof body === 'object' ? body : {};

  const mood = normalizeChoice(input.mood, MOODS);
  if (!mood) errors.push(`mood must be one of: ${MOODS.join(', ')}`);

  const { duration } = input;
  if (!Number.isInteger(duration) || duration < MIN_DURATION || duration > MAX_DURATION) {
    errors.push(`duration must be a whole number of minutes between ${MIN_DURATION} and ${MAX_DURATION}`);
  }

  const activity = normalizeChoice(input.activity, ACTIVITIES, ACTIVITY_ALIASES);
  if (!activity) errors.push(`activity must be one of: ${ACTIVITIES.join(', ')}`);

  const difficulty = normalizeChoice(input.difficulty, DIFFICULTIES, DIFFICULTY_ALIASES);
  if (!difficulty) errors.push(`difficulty must be one of: ${DIFFICULTIES.join(', ')}`);

  if (errors.length > 0) return { errors };
  return { value: { mood, duration, activity, difficulty } };
}