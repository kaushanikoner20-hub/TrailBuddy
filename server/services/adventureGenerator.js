import { config } from '../config.js';
import { SYSTEM_PROMPT, buildAdventurePrompt } from '../prompts/adventurePrompt.js';
import { MODEL_OUTPUT_SCHEMA, validateModelAdventure } from '../validation/adventureSchema.js';
import { generate } from './ollama.js';
import { extractJson } from './modelJson.js';

const MAX_ATTEMPTS = 2;

export class AdventureOutputError extends Error {
  constructor(details) {
    super('The model did not return a valid adventure.');
    this.name = 'AdventureOutputError';
    this.code = 'INVALID_MODEL_OUTPUT';
    this.status = 502;
    this.details = details;
  }
}

/**
 * Asks Gemma for an adventure, validates it, and retries once if the output is unusable.
 * Ollama errors (unavailable, missing model, timeout) are not retried and pass straight through.
 */
export async function generateAdventure(request) {
  const prompt = buildAdventurePrompt(request);
  let problems = [];

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const text = await generate({ prompt, system: SYSTEM_PROMPT, format: MODEL_OUTPUT_SCHEMA });

    const raw = extractJson(text);
    if (!raw) {
      problems = ['model output was not valid JSON'];
      continue;
    }

    const result = validateModelAdventure(raw, request);
    if (result.adventure) return { adventure: result.adventure, model: config.ollamaModel };
    problems = result.errors;
  }

  console.error('Model output rejected:', problems.join('; '));
  throw new AdventureOutputError(problems);
}