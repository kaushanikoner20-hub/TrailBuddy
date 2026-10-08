// Load .env if present (built into Node 20.12+; no extra dependency).
try {
  process.loadEnvFile();
} catch {
  // No .env file: fall back to real environment variables and defaults.
}

export const config = {
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'gemma3:4b',
  port: Number(process.env.PORT) || 3001,
  generationTimeoutMs: Number(process.env.OLLAMA_TIMEOUT_MS) || 120000,
};