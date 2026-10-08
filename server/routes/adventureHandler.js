import { validateAdventureRequest } from '../validation/adventureRequest.js';
import { generateAdventure } from '../services/adventureGenerator.js';

const USER_MESSAGES = {
  OLLAMA_UNAVAILABLE: "TrailBuddy can't reach your local AI model. Make sure Ollama is running.",
  MODEL_NOT_FOUND: "The configured Gemma model isn't available locally. Check your Ollama models.",
  OLLAMA_TIMEOUT: 'The local model took too long to respond. Try a shorter adventure or try again.',
  OLLAMA_ERROR: 'The local model returned an error. Try again.',
  MALFORMED_RESPONSE: 'The local model returned an unreadable response. Try again.',
  INVALID_MODEL_OUTPUT: "Gemma's adventure didn't come out right. Try again.",
};

/**
 * Turns a request body into { status, body } for the HTTP layer.
 * Kept free of Express so it can be tested directly.
 */
export async function handleAdventureRequest(requestBody) {
  const validation = validateAdventureRequest(requestBody);
  if (validation.errors) {
    return {
      status: 400,
      body: { success: false, error: 'Invalid input.', code: 'INVALID_INPUT', details: validation.errors },
    };
  }

  try {
    const { adventure, model } = await generateAdventure(validation.value);
    return { status: 200, body: { success: true, adventure, model } };
  } catch (err) {
    if (USER_MESSAGES[err.code] && err.status) {
      return { status: err.status, body: { success: false, error: USER_MESSAGES[err.code], code: err.code } };
    }
    console.error('Unexpected error:', err);
    return {
      status: 500,
      body: { success: false, error: 'Something went wrong creating your adventure. Try again.', code: 'INTERNAL_ERROR' },
    };
  }
}