import { config } from '../config.js';
import { SYSTEM_PROMPT, buildAdventurePrompt } from '../prompts/adventurePrompt.js';
import { generate } from './ollama.js';

export async function generateAdventure({ activity, duration, difficulty }) {
  const prompt = buildAdventurePrompt({ activity, duration, difficulty });
  const adventure = await generate({ prompt, system: SYSTEM_PROMPT });
  return { adventure, model: config.ollamaModel };
}