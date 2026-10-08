# How it works

1. **User input** – The user picks an activity, duration, and difficulty in the React form.
2. **React** – `services/api.js` sends `POST /api/adventure` with `{ "activity": "walking", "duration": 30, "difficulty": "relaxed" }`. The UI shows a loading state.
3. **Express API** – The route validates the body. Invalid input gets a `400` with a list of problems.
4. **Adventure generator** – Builds a system prompt (rules and tone) and a user prompt (the three inputs).
5. **Ollama** – `ollama.js` sends the prompts to Ollama's `/api/generate` endpoint with `stream: false` and a timeout (default 120 s, set with `OLLAMA_TIMEOUT_MS`).
6. **Gemma** – The local model generates the text.
7. **Response** – Express returns `{ "adventure": "...", "model": "gemma3:4b" }`.
8. **React** – Displays the adventure in a card, labelled with the model that produced it.

## Error mapping

| Situation | HTTP status | Message shown |
|---|---|---|
| Invalid input | 400 | Validation details |
| Ollama not reachable | 503 | TrailBuddy can't reach your local AI model. Make sure Ollama is running. |
| Model not installed | 503 | The configured Gemma model isn't available locally. Check your Ollama models. |
| Timeout | 504 | The local model took too long to respond. |
| Bad/empty Ollama response | 502 | The local model returned an unreadable response. |
| Anything else | 500 | Something went wrong generating your adventure. |