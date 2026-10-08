# Why open-weight, local AI

## Cloud AI

```
User
 ↓
Internet
 ↓
External AI provider
 ↓
Model
```

## TrailBuddy

```
User
 ↓
Local application
 ↓
Ollama
 ↓
Gemma
```

## What this means

- **Local inference** – The model runs on your hardware via Ollama. The request from TrailBuddy goes to `localhost`.
- **Privacy** – Your chosen activity, time, and difficulty are not sent to an AI provider by TrailBuddy. (Downloading the model initially does use the internet.)
- **Model control** – Gemma 3 is open-weight: you choose which size to run and can inspect and manage it on your machine. "Open-weight" means the weights are available under Google's Gemma license terms; it is not the same as an OSI-approved open-source license.
- **No mandatory cloud AI API** – There are no API keys, accounts, or per-request billing.
- **Changing the model later** – The model name comes from `OLLAMA_MODEL` and all model calls live in `server/services/ollama.js`. Other Gemma 3 sizes (for example `gemma3:1b` for weaker machines) should work by changing that variable. The project intentionally targets Gemma 3.
- **Cost** – No per-token fees. The cost is your own hardware, disk space (about 3.3 GB for `gemma3:4b`), and electricity. Local models are generally slower and less capable than the largest cloud models.