import { config } from './config.js';
import { createApp } from './app.js';

createApp().listen(config.port, () => {
  console.log(`TrailBuddy server listening on http://localhost:${config.port}`);
  console.log(`Using model ${config.ollamaModel} at ${config.ollamaBaseUrl}`);
});