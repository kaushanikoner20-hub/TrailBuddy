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

The Vite development server proxies `/api` to port `3001`. If you change the backend port for development, update the proxy target in `client/vite.config.js` to match. If port `3001` is already serving this checkout, keep using that server instead of starting a second copy.

## Production-style run
```
npm run build
npm start
```
Open <http://localhost:3001>.

If another process occupies port 3001, start the production server on a free port for this terminal session:

```powershell
$env:PORT = "3002"
npm start
```

```bash
PORT=3002 npm start
```

Then open <http://localhost:3002>. Use the syntax for the shell shown in your terminal prompt.

## Troubleshooting

- **Ollama is unavailable:** start the Ollama app/service and check `ollama list`. Generation needs the local backend and Ollama to be running.
- **The configured Gemma model is missing:** run `ollama pull gemma3:4b`, then verify with `ollama run gemma3:4b "Say hello in one sentence"`.
- **The browser says the backend is unreachable:** start `npm run dev:server` and confirm it uses the port configured as Vite's `/api` proxy target. In production, confirm the server is listening on the port you selected.
- **Offline readiness is not green:** while online, reopen the production app, let the service worker finish installing, and retry the cache check. A cache update failure leaves the previous worker active; it does not remove saved adventure progress.
- **Port already in use:** identify the listening process before stopping it. For production, use a different `PORT` as shown above; for development, keep the Vite proxy and backend port in sync.

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
