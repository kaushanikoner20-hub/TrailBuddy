import { config } from './config.js';
import { createApp } from './app.js';

function safeEndpointLabel(value) {
  try {
    const endpoint = new URL(value);
    return `${endpoint.protocol}//${endpoint.host}`;
  } catch {
    return 'configured Ollama endpoint';
  }
}

createApp().listen(config.port, () => {
  console.log(`TrailBuddy server listening on http://localhost:${config.port}`);
  console.log(`Using model ${config.ollamaModel} at ${safeEndpointLabel(config.ollamaBaseUrl)}`);
});
