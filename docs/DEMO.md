# Demo and submission notes

## Demo setup

1. Start Ollama and confirm `gemma3:4b` appears in `ollama list`.
2. Follow [SETUP.md](SETUP.md) to build the production client and start the app. Use the production server for the PWA readiness flow.
3. Generate the adventure while the configured Express backend and Ollama/Gemma are reachable. Adventure generation is local; it is not available when those services are stopped.

## Demo outline

Suggested hook: “What if the best thing an AI could do for you was make you stop looking at it?”

1. Choose **Curious → 30 min → Explore → Gentle** and generate with the local model.
2. Briefly show the structured guide and one sensory mission.
3. Prepare the adventure and show **READY FOR OFFLINE USE**.
4. Show **ARE YOU GOING OUT?** and the playful decline interaction, then confirm going out.
5. Show the bird leaving during **LET'S MEET OUTSIDE NOW** and **PUT YOUR PHONE AWAY**.
6. In the prepared adventure, demonstrate the saved mission, optional timer, and progress. For an offline demo, disconnect only after readiness is confirmed; do not imply a new adventure can be generated offline.
7. Finish on the reflection screen and close with **TrailBuddy — The AI That Disappears.**

## Recording checklist

- [ ] Close unrelated windows and use a clean browser profile or a cleared demo adventure; keep real reflections and personal browser data out of frame.
- [ ] Use a readable browser size and zoom. Keep the address bar visible briefly to show the local app, then focus the content.
- [ ] Confirm Ollama is available before recording; the initial model load can take a minute.
- [ ] Capture the full animation and leave enough time to read the closing message.
- [ ] If demonstrating offline mode, prepare first, then use the browser's Offline control. State clearly that a new generation still requires local services.
- [ ] Record the timer and completion as user-controlled progress, not verified outdoor activity.
- [ ] Review the recording for accidental personal data before sharing it.

## Screenshot checklist

Capture these from the real running application; do not use mockups or generated substitutes:

- [ ] Personalization choices.
- [ ] A real locally generated adventure guide with a readable mission.
- [ ] Offline readiness showing **READY FOR OFFLINE USE**.
- [ ] Commitment screen with both choices visible.
- [ ] Closing scene with the bird in flight and the headline visible.
- [ ] Phone Away mission screen.
- [ ] Completion and optional reflection screen (use a non-personal demo reflection or leave it blank).

No screenshots are currently checked into the repository. Add only captures reviewed for legibility and private data.

## Public submission notes

**Short description:** TrailBuddy uses locally run Gemma through Ollama to turn a mood, a little available time, and an activity into a sensory outdoor adventure—then helps you put the phone away.

**Differentiator:** The AI prepares the experience and deliberately disappears. Prepared adventures can continue offline from the browser's saved data and cached app assets.

**Technologies:** React, Vite, Node.js, Express, Ollama, Gemma 3, Three.js, browser localStorage, and a service worker.

**Requirements:** Node.js 20.12+, npm, Ollama, and the configured Gemma model for generation. See [SETUP.md](SETUP.md).

**Known limits:** New generation needs the configured backend and Ollama/Gemma. Browser storage is not encrypted or guaranteed permanent. PWA and offline behavior vary by browser. TrailBuddy does not verify location or outdoor activity. The 3D scene needs WebGL and has a CSS fallback.

**Challenge tags:** `#devchallenge` `#hf26challenge`

These notes are drafts for review. No challenge submission or external post has been made.
