import { Router } from 'express';
import { validateAdventureRequest } from '../validation.js';
import { generateAdventure } from '../services/adventureGenerator.js';
import { OllamaError } from '../services/ollama.js';

const USER_MESSAGES = {
  OLLAMA_UNAVAILABLE: "TrailBuddy can't reach your local AI model. Make sure Ollama is running.",
  MODEL_NOT_FOUND: "The configured Gemma model isn't available locally. Check your Ollama models.",
  OLLAMA_TIMEOUT: 'The local model took too long to respond. Try a shorter activity or try again.',
  OLLAMA_ERROR: 'The local model returned an error. Try again.',
  MALFORMED_RESPONSE: 'The local model returned an unreadable response. Try again.',
};

const router = Router();

router.post('/', async (req, res) => {
  const result = validateAdventureRequest(req.body);
  if (result.errors) {
    return res.status(400).json({ error: 'Invalid input.', code: 'INVALID_INPUT', details: result.errors });
  }

  try {
    const { adventure, model } = await generateAdventure(result.value);
    return res.json({ adventure, model });
  } catch (err) {
    if (err instanceof OllamaError) {
      return res.status(err.status).json({ error: USER_MESSAGES[err.code] ?? err.message, code: err.code });
    }
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Something went wrong generating your adventure. Try again.', code: 'INTERNAL_ERROR' });
  }
});

export default router;