import { config } from '../config.js';

export class OllamaError extends Error {
  constructor(code, message, status = 502) {
    super(message);
    this.name = 'OllamaError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Sends a single prompt to the local Ollama server and returns the generated text.
 * Throws OllamaError with a stable `code` for every expected failure mode.
 */
export async function generate({ prompt, system }) {
  const { ollamaBaseUrl, ollamaModel, generationTimeoutMs } = config;

  let response;
  try {
    response = await fetch(`${ollamaBaseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: ollamaModel, prompt, system, stream: false }),
      signal: AbortSignal.timeout(generationTimeoutMs),
    });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      throw new OllamaError('OLLAMA_TIMEOUT', 'The local model took too long to respond.', 504);
    }
    throw new OllamaError('OLLAMA_UNAVAILABLE', "Can't reach Ollama.", 503);
  }

  if (response.status === 404) {
    throw new OllamaError('MODEL_NOT_FOUND', `Model "${ollamaModel}" is not installed in Ollama.`, 503);
  }
  if (!response.ok) {
    throw new OllamaError('OLLAMA_ERROR', `Ollama returned status ${response.status}.`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new OllamaError('MALFORMED_RESPONSE', 'Ollama returned a response that could not be read.');
  }

  const text = typeof data?.response === 'string' ? data.response.trim() : '';
  if (!text) {
    throw new OllamaError('MALFORMED_RESPONSE', 'Ollama returned an empty response.');
  }
  return text;
}