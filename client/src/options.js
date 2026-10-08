export const MOODS = [
  { value: 'calm', label: 'Calm' },
  { value: 'energized', label: 'Energized' },
  { value: 'clear-head', label: 'Clear my head' },
  { value: 'curious', label: 'Curious' },
  { value: 'creative', label: 'Creative' },
];

export const DURATIONS = [15, 30, 45, 60, 90].map((m) => ({ value: m, label: `${m} min` }));

export const ACTIVITIES = [
  { value: 'walk', label: 'Walk' },
  { value: 'explore', label: 'Explore' },
  { value: 'sit-outside', label: 'Sit outside' },
  { value: 'observe-nature', label: 'Observe nature' },
  { value: 'photography', label: 'Photography' },
  { value: 'surprise-me', label: 'Surprise me' },
];

export const DIFFICULTIES = [
  { value: 'gentle', label: 'Gentle' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'adventurous', label: 'Adventurous' },
];

export const MISSION_ICONS = {
  hearing: '👂',
  vision: '👀',
  touch: '✋',
  memory: '🧠',
  curiosity: '🔍',
  movement: '🚶',
};

export function labelFor(options, value) {
  return options.find((o) => o.value === value)?.label ?? value;
}