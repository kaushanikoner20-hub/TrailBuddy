# Privacy

## Generation
- Generation uses a local Ollama server. TrailBuddy sends your choices (mood, time, activity, difficulty) inside a prompt to `OLLAMA_BASE_URL` (default `http://localhost:11434`) and nowhere else.
- There is no login, account, analytics, or tracking in the code.
- The server does not write adventures or inputs to disk. Startup logs show the model and Ollama endpoint host (without URL credentials or query parameters); unexpected errors are logged for diagnosis.
- If you change `OLLAMA_BASE_URL` to a remote machine, your prompts go there. That is your choice and your responsibility.

## Stored in your browser
- **Current session:** adventure, local ID, creation timestamp, prepared state, workflow screen, mission index, and completion/skip state in `localStorage` (`trailbuddy.session.v1`). It remains through completion until you explicitly return home.
- **Timer:** timestamp and pause/running state per adventure mission in `localStorage` (`trailbuddy.timer.v1:*`).
- **Reflections:** only if you press "Save in this browser", up to the latest 30, in `localStorage` (`trailbuddy.reflections.v1`). They are never sent to a server or to any AI model. Clear them by clearing this site's data in your browser.
- Browser storage is not encrypted storage and is not guaranteed to persist permanently. Browser settings, eviction, or clearing site data can remove it.
- The Express server still stores nothing.

## Not implemented
- Syncing, accounts, or backups of any kind.
- Encryption for browser storage.

## Not controlled by TrailBuddy
- Downloading Ollama and the Gemma model requires internet access to their hosts.
- Ollama's own behavior and settings are governed by Ollama.
