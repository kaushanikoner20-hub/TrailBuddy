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

## Gemma's role

Gemma is not a chatbot here. It is the **Outdoor Experience Designer**: it turns a mood, a time budget, an activity, and a difficulty into a small set of sensory missions. The app has no chat box and no follow-up conversation.

## What local inference means

- **Local inference.** The model runs on your hardware via Ollama. TrailBuddy sends requests to `localhost`.
- **Privacy.** Your mood and preferences are not sent to an AI provider by TrailBuddy. (Downloading Ollama and the model uses the internet once.)
- **Model control.** Gemma 3 is open-weight: you choose the size and run it yourself. "Open-weight" means the weights are available under Google's Gemma license terms; it is not the same as an OSI-approved open-source license.
- **No mandatory cloud AI API.** No keys, accounts, or per-request billing.
- **Changing the model later.** The model name comes from `OLLAMA_MODEL` and all model calls live in `server/services/ollama.js`. Other Gemma 3 sizes should work by changing that variable. The project intentionally targets Gemma 3.
- **Cost.** No per-token fees. You pay with your own hardware, disk space (about 3.3 GB for `gemma3:4b`), and electricity.
- **Trade-off.** Small local models are less capable and less predictable than the largest cloud models. That is why TrailBuddy asks for structured output and validates it instead of trusting the model.