# Demo (Stage 2)

1. Confirm Ollama is running and `gemma3:4b` appears in `ollama list`.
2. Start the backend and frontend (see [SETUP.md](SETUP.md)) and open <http://localhost:5173>.
3. Walk through the screens: **Calm → 30 min → Walk → Gentle**, then **Get me outside**. Point out the loading state, then the field-guide adventure and the "Generated locally by gemma3:4b" line.
4. Click **Plan a different one** and try **Energized → 45 min → Explore → Moderate**. Show that the missions change tone and pace.
5. Try **Curious → 15 min → Observe nature → Gentle** for a short, observation-heavy adventure.
6. Click **Start my adventure** and explain the note: Phone Away Mode is Stage 3 and not built.
7. Show error handling: quit Ollama and generate again to see the "can't reach your local AI model" message.

Be upfront about scope: this is Stage 2. Phone Away Mode, offline use, and saving are not built yet.