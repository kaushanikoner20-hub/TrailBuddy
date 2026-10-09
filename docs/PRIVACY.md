# Privacy

## Implemented now (Stage 1)
- Generation uses a local Ollama server. TrailBuddy sends your choices (mood, time, activity, difficulty) inside a prompt to `OLLAMA_BASE_URL` (default `http://localhost:11434`) and nowhere else.
- There is no login, account, analytics, or tracking in the code.
- The server does not write adventures or inputs to disk. It logs only startup information and unexpected errors.
- If you change `OLLAMA_BASE_URL` to a remote machine, your prompts go there. That is your choice and your responsibility.

## Stored in your browser (implemented in Stage 3)
- **Current session:** the adventure you generated and your mission progress, in this browser's `localStorage` (`trailbuddy.session.v1`), so a reload doesn't lose them. It is removed when you finish, press "Back to home", or start over. No history is kept.
- **Reflections:** only if you press "Save in this browser", up to the latest 30, in `localStorage` (`trailbuddy.reflections.v1`). They are never sent to a server or to any AI model. Clear them by clearing this site's data in your browser.
- The Express server still stores nothing.

## Not implemented yet
- Syncing, accounts, or backups of any kind.
- Offline use (Stage 4).

## Not controlled by TrailBuddy
- Downloading Ollama and the Gemma model requires internet access to their hosts.
- Ollama's own behavior and settings are governed by Ollama.