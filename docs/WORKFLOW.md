# How it works

1. **User input.** The React wizard asks four questions, one per screen: mood, time, activity, adventurousness.
2. **React.** `services/api.js` sends `POST /api/adventure` with `{ mood, duration, activity, difficulty }`.
3. **Request validation.** `server/validation/adventureRequest.js` checks every field. Invalid input gets a `400`. (Stage 1's activity/difficulty words such as `walking` and `relaxed` are still accepted and mapped; `mood` is now required.)
4. **Adventure generator.** `adventureGenerator.js` builds the prompt and calls Ollama.
5. **Prompt.** `adventurePrompt.js` casts Gemma as the *Outdoor Experience Designer*, lists safety and screen-free constraints, adds guidance for the chosen mood/activity/difficulty, and asks for a specific number of missions adding up to about 85% of the time.
6. **Ollama + Gemma.** `ollama.js` calls `/api/generate` with `stream: false` and a JSON schema in `format`, which asks Ollama for structured output.
7. **JSON extraction.** `modelJson.js` parses the response. It also tolerates markdown fences and extra text around the object.
8. **Output validation.** `adventureSchema.js` checks the model's fields: non-empty bounded text, 3–7 missions, valid mission types, whole-minute mission durations, and mission minutes that add up to between 50% and 110% of the requested time.
9. **Retry.** If the output is not valid JSON or fails validation, the generator asks again once. Ollama failures (not running, missing model, timeout) are not retried.
10. **Final shape.** The server adds the fields it already knows (`duration`, `mood`, `activity`, `difficulty`, `phone_free: true`) and numbers the missions with ids 1..n. Gemma only writes the creative content.
11. **Response.** `{ success: true, adventure, model }`, or `{ success: false, error, code }`.
12. **React.** Renders the adventure as a field guide.

## Error mapping

| Situation | HTTP status | Message shown |
|---|---|---|
| Invalid input | 400 | Validation details |
| Ollama not reachable | 503 | TrailBuddy can't reach your local AI model. Make sure Ollama is running. |
| Model not installed | 503 | The configured Gemma model isn't available locally. Check your Ollama models. |
| Timeout | 504 | The local model took too long to respond. |
| Ollama error / unreadable response | 502 | The local model returned an error / unreadable response. |
| Unusable adventure after retry | 502 | Gemma's adventure didn't come out right. Try again. |
| Anything else | 500 | Something went wrong creating your adventure. |

Internal validation details are logged on the server, not sent to the browser.

## After generation: prepare, then leave

```
Adventure generated (Stage 2, Gemma)
 ↓
PREPARE MY ADVENTURE (production cache + local data check)
 ↓
START MY ADVENTURE
 ↓
"ARE YOU GOING OUT?"  ── NO ──► lighthearted reply ──► back to adventure, or "take me outside anyway"
 ↓ YES
3D closing scene: bird takes off, flies away
 ↓
"LET'S MEET OUTSIDE NOW" · "PUT YOUR PHONE AWAY"
 ↓
Phone Away Mode: one mission at a time
 ↓
WELCOME BACK 🌿 (optional reflection) → home
```

**Where the missions come from.** Phone Away Mode reads `adventure.missions` from the same object Stage 2 produced and validated. It shows one mission at a time and never calls the server or Gemma again, so entering it makes no AI request, and going back does not regenerate anything.

**The commitment screen.** The *NO* button hops away from a **mouse** pointer up to four times (at most one hop per 450 ms), staying inside the viewport and away from the YES button, then returns home and behaves like a normal button. Touch and keyboard never trigger it, `prefers-reduced-motion` disables it, and the button is clickable at all times. Messages ("Nice try.", "The trees are waiting!", …) change once per hop.

**The closing scene.** About 7 seconds: *arrival* (the bird sits on a branch), *takeoff* (wings unfold and flap, the bird leaves the branch), *message* (the headline fades in as it flies off), *settled*. "Skip animation" jumps to the end; "Replay" runs it again. There is no auto-advance: you continue when you're ready.

**The optional timer.** It starts only when you press its button. Its state is saved per adventure and mission. Remaining time is computed from timestamps, so an active timer includes time while a page is suspended; pausing freezes elapsed time. When it ends it only says "Timer finished": it never completes the mission. Timer time is not evidence of time spent outside.

**What is saved, and where.** The current adventure and mission progress are kept in this browser's `localStorage` so a reload doesn't lose them. The session remains saved through completion and is cleared when you explicitly return home. A reflection is saved only if you press "Save in this browser". See [PRIVACY.md](PRIVACY.md).
