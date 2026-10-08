export const ACTIVITIES = ['walking', 'hiking', 'running', 'cycling', 'photography'];
export const DIFFICULTIES = ['relaxed', 'moderate', 'challenging'];
export const MIN_DURATION = 10;
export const MAX_DURATION = 240;

/**
 * Validates an adventure request body.
 * Returns { value } with normalized input, or { errors } with readable messages.
 */
export function validateAdventureRequest(body) {
  const errors = [];
  const input = body && typeof body === 'object' ? body : {};

  const activity = typeof input.activity === 'string' ? input.activity.trim().toLowerCase() : '';
  if (!ACTIVITIES.includes(activity)) {
    errors.push(`activity must be one of: ${ACTIVITIES.join(', ')}`);
  }

  const duration = input.duration;
  if (!Number.isInteger(duration) || duration < MIN_DURATION || duration > MAX_DURATION) {
    errors.push(`duration must be a whole number of minutes between ${MIN_DURATION} and ${MAX_DURATION}`);
  }

  const difficulty = typeof input.difficulty === 'string' ? input.difficulty.trim().toLowerCase() : '';
  if (!DIFFICULTIES.includes(difficulty)) {
    errors.push(`difficulty must be one of: ${DIFFICULTIES.join(', ')}`);
  }

  if (errors.length > 0) return { errors };
  return { value: { activity, duration, difficulty } };
}