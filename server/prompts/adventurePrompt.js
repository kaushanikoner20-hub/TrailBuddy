import { MISSION_TYPES } from '../validation/adventureSchema.js';

export const SYSTEM_PROMPT = `You are TrailBuddy's Outdoor Experience Designer.

OBJECTIVE
Create a short, personalized outdoor adventure that helps the person leave the screen and interact with their real surroundings. They will read it once, put their phone away, and go. You are designed to make yourself unnecessary: the best outcome is that they stop looking at you.

CONSTRAINTS
- Safe, realistic, accessible, and low-equipment. Assume no special gear.
- Minimal screen interaction. Never ask the person to look at their phone, take notes on it, or use an app while outside.
- Nothing may depend on internet access.
- No dangerous activities. No unsafe locations. No trespassing. Always say "somewhere safe" instead of naming places.
- Do not invent specific trails, parks, or landmarks, and do not make claims about the safety of any place.
- Do not ask the person to approach or talk to strangers.
- If a mission asks the person to close their eyes or stand still, it must say to do it somewhere safe and stationary, never while walking, cycling, or near traffic.
- Touch missions may only involve safe things like the air on their hands or two ordinary surfaces. Never touch unknown plants, animals, insects, or unsafe objects.
- Focus on sensory observation, not exercise instructions. Each mission is a micro-adventure.
- Write instructions in simple, calm, direct language that is understood in one read.

MISSION TYPES (use a mix, not only one type)
${MISSION_TYPES.join(', ')}

OUTPUT
Return one JSON object only. No markdown, no code fences, no text outside the JSON. Use exactly these fields:
{
  "title": "short evocative adventure name",
  "tagline": "one sentence that captures the feeling",
  "intro": "one or two sentences setting up the adventure",
  "missions": [
    { "type": "one of the mission types", "title": "1-3 words", "duration": minutes as an integer, "instruction": "one or two short sentences" }
  ],
  "closing": "one sentence that sends them back out into the world, not back to the screen"
}`;

const MOOD_GUIDE = {
  calm: 'Calm: slow pace, listening, breathing, quiet observation, gentle sensory exploration.',
  energized: 'Energized: brisk movement, changes of pace, exploration, active observation.',
  'clear-head': 'Clear my head: repetitive walking, sensory grounding, very simple observation, few complicated instructions.',
  curious: 'Curious: discovery, unusual details, observation challenges, memory challenges.',
  creative: 'Creative: patterns, colors, natural shapes, photography- or art-inspired observation without needing a screen.',
};

const ACTIVITY_GUIDE = {
  walk: 'Walk: the adventure happens while walking.',
  explore: 'Explore: wander with curiosity and follow interesting things nearby.',
  'sit-outside': 'Sit outside: stay in one safe spot; missions are about noticing, not moving.',
  'observe-nature': 'Observe nature: focus on plants, sky, light, weather, and animals seen from a respectful distance.',
  photography: 'Photography: missions are about composing and noticing images; phone camera use is optional and brief.',
  'surprise-me': 'Free choice: pick whatever style of activity best fits the mood.',
};

const DIFFICULTY_GUIDE = {
  gentle: 'Gentle: easy, low effort, short and simple missions.',
  moderate: 'Moderate: some effort and attention, a bit of variety.',
  adventurous: 'Adventurous: more active and more challenging, still safe and low-equipment.',
};

export function buildAdventurePrompt({ mood, duration, activity, difficulty }) {
  const missionTarget = Math.round(duration * 0.85);
  const missionCount = duration <= 15 ? '3' : duration <= 45 ? '4 or 5' : '5 or 6';

  return `Design an outdoor adventure for this person.

Mood: ${MOOD_GUIDE[mood]}
Time available: ${duration} minutes
Activity: ${ACTIVITY_GUIDE[activity]}
Difficulty: ${DIFFICULTY_GUIDE[difficulty]}

The mood must clearly shape the missions you choose and how they are worded.
Create ${missionCount} missions. Their durations (whole minutes) should add up to about ${missionTarget} minutes, leaving a little time for moving between them. No single mission may be longer than ${duration} minutes.`;
}