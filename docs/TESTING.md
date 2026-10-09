# Testing

This file records only what has actually been run. Unchecked items have **not** been verified.

## Automated tests (`npm test`)
Stage 4 run in the current checkout: 66 tests, 66 passed. This covers server validation/generation logic and client state, persistence, timer, scene timeline, and runaway geometry logic; it does not call a real Gemma model.

Stage 3 additions (28 client-side tests, pure logic only):
- [x] Journey state machine (`state/journey.test.js`): happy path, ignored out-of-place actions, back from the commitment screen keeps the same adventure, exit keeps progress, restart-missions, finish.
- [x] Persistence (`state/storage.test.js`): save/restore, progress restored to the resume screen, completion/home clear the session, corrupt or tampered data ignored, missing storage never throws, reflections trimmed/capped.
- [x] Timer math (`phone-away/timerModel.test.js`): timestamp-based remaining time, pause/resume, clamping, formatting.
- [x] Runaway button geometry (`commitment/runawayMath.test.js`): 300 random cases stay in the viewport, off the YES button, and away from the pointer.
- [x] Scene choreography (`closing/sceneTimeline.test.js`): phases within 5–8 s, bird perched then airborne and receding, finite poses at any time, deterministic tree layout that keeps the view clear.

These tests found and fixed one real bug (`isAdventure` returned `null` instead of `false`).

## Browser tests (sandbox, headless Chromium via Playwright, API stubbed)
The Gemma API was **stubbed** for these tests (the app itself contains no fake responses). 16 checks, 16 passed:
- [x] Commitment screen shows the exact copy and both buttons.
- [x] Mouse: the NO button hops away at most four times, stays in the viewport, never overlaps YES, then returns home and is clickable.
- [x] NO via keyboard shows the lighthearted reply; "Back to my adventure" returns to the same adventure with no second API request.
- [x] Keyboard Tab reaches both buttons and focus does not make NO run.
- [x] Touch (emulated): tapping NO works and the button never moves.
- [x] Reduced motion: NO does not run away; the closing page settles immediately with no Replay.
- [x] Closing page with the 3D chunk failing to load, and with WebGL disabled: the fallback shows the exact headline and the other three lines, there are no uncaught errors, and Continue reaches Phone Away Mode.
- [x] Skip animation, including the regression where an early skip was undone by a timer (fixed).
- [x] Phone Away Mode shows the stubbed adventure's missions one at a time; Done and Skip work; the completion screen shows "2 of 3 missions marked complete"; a reflection saves to `localStorage`; Back to home clears the session; exactly one API request was made in the whole journey.
- [x] Pause overlay, Exit keeps progress, Resume is offered.
- [x] Reload keeps the adventure, and in-progress missions show Resume without regenerating.
- [x] Timer (fake clock): does not start by itself, shows 4:00 after one minute, pause freezes it, a long gap ends in "Timer finished", and the mission is not completed by the timer.

These tests also found and fixed one real bug: the closing scene's `.closing` CSS class collided with the adventure guide's closing paragraph and blocked the Start button (scene class renamed to `.outro`).

## Stage 4 verification

- [x] `npm run build --prefix client`: Vite production build succeeded; emitted a manifest, versioned service worker, main bundles, lazy closing-scene chunk, and lazy Three.js scene chunk.
- [x] Generated worker asset list includes the app shell, manifest, SVG icon, main JS/CSS, closing-scene JS/CSS, and `OutdoorScene` chunk.
- [x] Local production preview returned HTTP 200 for `/`, `/manifest.webmanifest`, `/sw.js`, the icon, main JS, and the lazy Three.js chunk.
- [x] Timer persistence unit coverage: running timestamps restore elapsed time; paused timers remain frozen; malformed and unavailable storage fail safely.
- [x] Session storage coverage: prepared metadata and workflow restore; completion remains restorable until explicit return home.
- [ ] Browser service-worker registration and cache inspection.
- [ ] Reload with browser offline mode and complete the entire outdoor journey.
- [ ] Real Gemma/Ollama generation followed by network-disconnected mission completion; unavailable in this verification environment.
- [ ] Browser network inspection proving no `/api/adventure` calls after generation; source flow uses only the in-memory/localStorage adventure after generation, but browser Network tooling was unavailable.

## NOT verified: rendered 3D scene
The production build contains the Three.js chunk but there was no graphical browser/WebGL verification surface available, so:
- [ ] The Three.js scene renders (trees, ground, sky, lighting)
- [ ] The bird is visible on the branch, takes off, flaps, and flies away
- [ ] The headline is readable over the real 3D scene on desktop and mobile
- [ ] Performance on a modest laptop and phone
- [ ] WebGL resources are released when leaving the scene
- [ ] Context-loss handling

Its timing and layout logic is unit tested; actual rendering, performance, and WebGL context handling remain unverified.

## Still to do on a real machine
- [ ] Verify the service worker and readiness panel in a supported browser
- [ ] Complete the offline journey in browser DevTools Offline mode
- [ ] Full flow with real Gemma: generate, commitment, closing scene, Phone Away Mode, completion
- [ ] Real touch device and real screen reader
- [ ] Gemma's missions respect the new "closed eyes only while stationary" prompt line (spot-check several adventures)
- [ ] `docker compose up --build`
- [ ] GitHub Actions workflow
