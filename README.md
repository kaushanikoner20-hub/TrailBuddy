# 🌿 TrailBuddy

**Get outside. Let local AI plan the adventure.**

TrailBuddy is a local-first outdoor adventure generator. You choose an activity, how much time you have, and how hard you want it to be. A Gemma 3 model running on your own machine through Ollama writes a short, personalized outdoor adventure for you.

> **Current stage: Stage 1 — Foundation.** The full React → Express → Ollama → Gemma 3 pipeline works. Everything beyond that is planned, not built. See [Current limitations](#current-limitations).

## Why TrailBuddy?

People often want to spend time outdoors but stay tied to their screens. TrailBuddy uses AI to prepare a personalized outdoor experience, then encourages you to put the phone away and experience the real world.

The idea: *let AI prepare the experience, then let the user put the phone away.*

## Open AI approach

- [Gemma 3](https://ai.google.dev/gemma) is an open-weight model.
- [Ollama](https://ollama.com) runs Gemma locally on your computer.
- TrailBuddy does not use a cloud LLM API. Prompts are sent to `localhost`, not to an AI provider.
- Local inference is central to the design: the model is a real dependency, and if it is unavailable the app shows an error instead of faking a response.

## Architecture

```
User
 ↓
React (Vite)
 ↓
Node / Express
 ↓
Ollama
 ↓
Gemma 3
 ↓
Adventure
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

## Setup

**Prerequisites:** Node.js 20.12 or newer, npm, and [Ollama](https://ollama.com/download).

1. **Install Ollama** from <https://ollama.com/download> and make sure it is running.
2. **Install Gemma 3:**
   ```
   ollama pull gemma3:4b
   ```
3. **Verify it works:**
   ```
   ollama list
   ollama run gemma3:4b "Say hello in one sentence"
   ```
4. **Install dependencies:**
   ```
   npm run install:all
   ```
5. **Configure the environment** (optional; the defaults match `.env.example`):
   ```
   cp .env.example .env          # PowerShell: Copy-Item .env.example .env
   ```
6. **Start the backend** (port 3001):
   ```
   npm run dev:server
   ```
7. **Start the frontend** in a second terminal (port 5173):
   ```
   npm run dev:client
   ```

Open <http://localhost:5173>, pick an activity, and click **Generate adventure**.

More detail: [docs/SETUP.md](docs/SETUP.md). Run the automated tests with `npm test`.

## Current limitations

- **Offline outdoor mode is not implemented yet.** Generating an adventure needs the local Ollama server running; the app does not yet save adventures or work as an installable offline app.
- **Local persistence is not implemented yet.** Adventures are shown on screen and are not saved.
- **Touch Grass Mode is planned for a later stage.**
- Responses are plain text from the model and are not structured or checked for accuracy. Use common sense outdoors.
- Docker support is minimal and runs only the app; Ollama and Gemma run on your host.

## Documentation

[Project overview](docs/PROJECT_OVERVIEW.md) · [Architecture](docs/ARCHITECTURE.md) · [How it works](docs/HOW_IT_WORKS.md) · [Open AI](docs/OPEN_AI.md) · [Offline mode](docs/OFFLINE_MODE.md) · [Privacy](docs/PRIVACY.md) · [Setup](docs/SETUP.md) · [Demo](docs/DEMO.md) · [Design decisions](docs/DESIGN_DECISIONS.md) · [Testing](docs/TESTING.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)