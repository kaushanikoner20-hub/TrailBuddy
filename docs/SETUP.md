# Setup

Commands work in macOS/Linux shells and Windows PowerShell unless noted.

## 1. Prerequisites
- Node.js 20.12 or newer (`node -v`)
- npm (`npm -v`)
- Ollama: <https://ollama.com/download>

## 2. Install the Gemma model
```
ollama pull gemma3:4b
ollama list
```
`gemma3:4b` is about 3.3 GB. On a machine with little RAM you can try `gemma3:1b` and set `OLLAMA_MODEL=gemma3:1b`.

## 3. Verify Gemma works
```
ollama run gemma3:4b "Say hello in one sentence"
```
Type `/bye` to exit. You can also check the API: `curl http://localhost:11434/api/tags` (on Windows PowerShell use `curl.exe`).

## 4. Install dependencies
From the repository root:
```
npm run install:all
```
This installs the server dependencies and the client dependencies (including `three`, used by the closing scene).

## 5. Configure
```
cp .env.example .env          # PowerShell: Copy-Item .env.example .env
```
Defaults: `OLLAMA_BASE_URL=http://localhost:11434`, `OLLAMA_MODEL=gemma3:4b`, `PORT=3001`. `.env` is git-ignored.

## 6. Run
Terminal 1: `npm run dev:server`
Terminal 2: `npm run dev:client`
Open <http://localhost:5173>.

## Production-style run
```
npm run build
npm start
```
Open <http://localhost:3001>.

## Docker (optional, minimal)
Docker runs only the app. Ollama and Gemma must be running on your host.
```
docker compose up --build
```
Open <http://localhost:3001>. The Docker setup has not been tested yet; see [TESTING.md](TESTING.md).

## Tests
```
npm test
```