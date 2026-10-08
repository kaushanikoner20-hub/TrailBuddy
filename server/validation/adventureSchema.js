export const MISSION_TYPES = ['hearing', 'vision', 'touch', 'memory', 'curiosity', 'movement'];
export const MIN_MISSIONS = 3;
export const MAX_MISSIONS = 7;

// Total mission minutes must land in this range relative to the requested duration.
// Less than 100% leaves room for walking between missions.
const MIN_TOTAL_RATIO = 0.5;
const MAX_TOTAL_RATIO = 1.1;

/**
 * JSON schema sent to Ollama (structured outputs) so Gemma is steered toward this shape.
 * The server still validates the result; the model is never trusted.
 * Echoed fields (mood, activity, difficulty, duration) and mission ids are added by the server.
 */
export const MODEL_OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    tagline: { type: 'string' },
    intro: { type: 'string' },
    missions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: MISSION_TYPES },
          title: { type: 'string' },
          duration: { type: 'integer' },
          instruction: { type: 'string' },
        },
        required: ['type', 'title', 'duration', 'instruction'],
      },
    },
    closing: { type: 'string' },
  },
  required: ['title', 'tagline', 'intro', 'missions', 'closing'],
};

const TEXT_LIMITS = { title: 80, tagline: 160, intro: 300, closing: 300 };
const MISSION_TITLE_MAX = 60;
const MISSION_INSTRUCTION_MAX = 400;

function isText(value, max) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max;
}

function validateMission(mission, index, requestedDuration) {
  const label = `missions[${index}]`;
  if (!mission || typeof mission !== 'object') return [`${label} must be an object`];

  const errors = [];
  if (!MISSION_TYPES.includes(mission.type)) errors.push(`${label}.type must be one of: ${MISSION_TYPES.join(', ')}`);
  if (!isText(mission.title, MISSION_TITLE_MAX)) errors.push(`${label}.title must be 1-${MISSION_TITLE_MAX} characters`);
  if (!isText(mission.instruction, MISSION_INSTRUCTION_MAX)) {
    errors.push(`${label}.instruction must be 1-${MISSION_INSTRUCTION_MAX} characters`);
  }
  if (!Number.isInteger(mission.duration) || mission.duration < 1 || mission.duration > requestedDuration) {
    errors.push(`${label}.duration must be a whole number of minutes between 1 and ${requestedDuration}`);
  }
  return errors;
}

/**
 * Validates the JSON object produced by the model against the request it was made for.
 * Returns { adventure } in the final public shape, or { errors }.
 */
export function validateModelAdventure(raw, request) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { errors: ['model output must be a JSON object'] };
  }

  const errors = [];
  for (const [field, max] of Object.entries(TEXT_LIMITS)) {
    if (!isText(raw[field], max)) errors.push(`${field} must be 1-${max} characters`);
  }

  if (!Array.isArray(raw.missions)) {
    errors.push('missions must be an array');
  } else if (raw.missions.length < MIN_MISSIONS || raw.missions.length > MAX_MISSIONS) {
    errors.push(`missions must contain ${MIN_MISSIONS} to ${MAX_MISSIONS} items`);
  } else {
    raw.missions.forEach((m, i) => errors.push(...validateMission(m, i, request.duration)));
  }

  if (errors.length > 0) return { errors };

  const total = raw.missions.reduce((sum, m) => sum + m.duration, 0);
  if (total < request.duration * MIN_TOTAL_RATIO || total > request.duration * MAX_TOTAL_RATIO) {
    return {
      errors: [`mission durations add up to ${total} minutes, which does not fit a ${request.duration}-minute adventure`],
    };
  }

  return {
    adventure: {
      title: raw.title.trim(),
      tagline: raw.tagline.trim(),
      duration: request.duration,
      mood: request.mood,
      activity: request.activity,
      difficulty: request.difficulty,
      phone_free: true,
      intro: raw.intro.trim(),
      missions: raw.missions.map((m, i) => ({
        id: i + 1,
        type: m.type,
        title: m.title.trim(),
        duration: m.duration,
        instruction: m.instruction.trim(),
      })),
      closing: raw.closing.trim(),
    },
  };
}