# Demo (Stage 1)

1. Confirm Ollama is running and `gemma3:4b` appears in `ollama list`.
2. Start the backend and frontend (see [SETUP.md](SETUP.md)) and open <http://localhost:5173>.
3. Leave the defaults (Walking, 30 minutes, Relaxed) and click **Generate adventure**. Point out the loading state, then the adventure card labelled with the model name.
4. Change the inputs (for example Hiking, 60 minutes, Moderate) and generate again to show the output changes.
5. Show the error handling: quit Ollama (or stop the service) and generate again. The app shows "TrailBuddy can't reach your local AI model. Make sure Ollama is running."
6. Optional: set `OLLAMA_MODEL=gemma3:does-not-exist`, restart the server, and generate to show the missing-model message.

Be upfront about scope: this is Stage 1. Saving, offline use, and Touch Grass Mode are not built yet.