# Demo (Stage 3)

1. Confirm Ollama is running and `gemma3:4b` appears in `ollama list`.
2. Start the backend and frontend (see [SETUP.md](SETUP.md)) and open <http://localhost:5173>.
3. Walk through the screens (for example **Calm → 30 min → Walk → Gentle**), click **Get me outside**, and wait for the Gemma-generated field guide.
4. Click **Start my adventure**. On the *ARE YOU GOING OUT?* screen, move the mouse toward **NO, I'M NOT**: it hops away a few times, then settles. Click it to see the lighthearted reply, then use **Back to my adventure** (nothing is regenerated).
5. Start again and click **YES, I'M GOING**. Watch the bird take off and fly away as **LET'S MEET OUTSIDE NOW** appears. Try **Skip animation** and **Replay**.
6. Click **Continue**, then **Begin Phone Away Mode**. Walk through the missions: **Done**, **Skip this one**, the optional timer, **Pause**, and **Exit**.
7. Finish for the **WELCOME BACK** screen. Optionally write and save a reflection (stored only in this browser).
8. Show resilience: reload mid-adventure (your place is kept), or quit Ollama before generating to see the friendly error.

Be upfront about scope: this is Stage 3. Offline/PWA support is not built yet, and TrailBuddy cannot tell whether you actually went outside.