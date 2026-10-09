# Design decisions

## Stage 1 decisions
- **Gemma 3** – Open-weight, with small sizes that run on ordinary laptops. `gemma3:4b` is the default balance of quality and size.
- **Ollama** – The simplest way to run local models, with a plain local HTTP API.
- **React + Vite** – Fast setup and familiar to contributors. Styling is plain CSS to avoid extra build tooling.
- **Node / Express** – Small and widely known; keeps the model connection and prompt out of the browser. Uses Node's built-in `fetch`, `node:test`, and `process.loadEnvFile`.
- **Local-first architecture** – The AI runs on the user's machine. It is the core idea, not an add-on.
- **No authentication / no cloud LLM API** – No accounts or user data to protect, no keys or billing, and the open-weight model stays a real dependency.

## Stage 2 decisions
- **Gemma as "Outdoor Experience Designer", not a chatbot.** The product goal is to get the user off the screen, so there is no conversation to continue.
- **Structured JSON output.** Predictable adventures let the UI render missions consistently and let later stages (Phone Away Mode, offline saving) rely on the shape.
- **Do not trust the model.** Output is parsed, validated, and retried once. Ollama's JSON-schema `format` steers the model; server-side validation is what actually guarantees the shape.
- **The server owns the facts it already knows.** `duration`, `mood`, `activity`, `difficulty`, `phone_free`, and mission `id`s are added by the server rather than echoed by the model. This removes failure modes for a small model, but it means the server does not detect the model "ignoring" the mood in those fields. Whether missions actually reflect the mood is judged by reading the output (see TESTING).
- **Sensory missions.** Hearing, vision, touch, memory, curiosity, and movement missions make the time outside about noticing, not exercise.
- **One question per screen.** The wizard shrinks to a single decision at a time and ends in one button, in keeping with an interface that wants you to leave.
- **Backward compatibility.** Stage 1 activity/difficulty words are still accepted. `mood` is required.
- **A placeholder for Stage 3.** "Start my adventure" shows an honest note instead of faking Phone Away Mode.
- **No safety guarantees.** The prompt asks for safe, low-equipment, no-trespassing missions, but the server only validates structure and timing, not real-world safety.

## Stage 3 decisions

- **Why a commitment screen?** Pressing "start" is easy to do absent-mindedly. A full-screen *Are you going out?* makes leaving the screen a decision, and sets the tone: this app wants you to leave.
- **Why a playful "No" button instead of a blocker?** It is a joke, not a coercive mechanism. It only dodges a mouse, only a few times, never on touch or keyboard, never when reduced motion is requested, and is never disabled. Saying no gets a kind reply and a way back. No dark patterns, no repeated dialogs, no forced redirects.
- **The meaning of the bird.** The bird leaves the scene on purpose: it doesn't stay inside the app, and neither should you. The closing page invites no further browsing: no cards, stats, or navigation, and nothing auto-advances.
- **Why Phone Away Mode?** After the exit moment the app should get out of the way: one mission at a time, large text, dark low-glare background, few controls. You read one instruction, put the phone away, and return briefly to mark it done.
- **Why Three.js directly (not React Three Fiber)?** One library (`three`) instead of three, and the scene is small and self-contained, so wrapping it in React adds little. Only one rendering approach is used.
- **Why procedural 3D (no model files)?** A locally bundled model needs a vetted license and can fail to load during a demo. Simple low-poly trees and a stylized bird built from geometric shapes have no asset to download, no license to track, and render the same everywhere. The bird is a stylized shape, not a realistic model.
- **Choreography as pure functions.** `sceneTimeline.js` computes bird path, wing angle, camera, phases, and tree layout from time alone, with unit tests. The Three.js code only applies those numbers.
- **Lazy loading and fallback.** The 3D chunk loads only when the user says yes, and only if WebGL exists. If it is missing, fails, or doesn't report ready within 10 seconds, the page shows a CSS-only hills backdrop with the same text. The fallback is not described as a 3D animation.
- **One state machine.** A single `screen` value with an allowed-actions table replaces scattered booleans, and keeps the generated adventure for the whole journey.
- **Small persistence.** Only the current session and optional reflections go in `localStorage`, with validation on load. No database, no state library.
- **Honest completion.** "Done" and the timer are self-reported. The app never claims you were outdoors or that screen time dropped.
- **Safety stance.** Phone Away Mode tells people to stop somewhere safe before reading, never to use the phone while crossing roads or cycling, and to skip anything that doesn't feel right. The prompt forbids eyes-closed instructions while moving. None of this is verified by code: the app cannot know where you are.
- **No browser-history routing.** Screens switch via state, not URLs. This keeps Stage 3 small; the back button leaves the app. The session survives a reload.