# Privacy

## Implemented now (Stage 1)
- Generation uses a local Ollama server. TrailBuddy sends your prompt to `OLLAMA_BASE_URL` (default `http://localhost:11434`) and nowhere else.
- There is no login, account, analytics, or tracking in the code.
- The server does not write adventures or inputs to disk. It logs only startup information and unexpected errors.
- If you change `OLLAMA_BASE_URL` to a remote machine, your prompts go there. That is your choice and your responsibility.

## Not implemented yet
- Saving adventures on your device (planned for a later stage). Nothing is stored locally by TrailBuddy today.
- Offline use.

## Not controlled by TrailBuddy
- Downloading Ollama and the Gemma model requires internet access to their hosts.
- Ollama's own behavior and settings are governed by Ollama.