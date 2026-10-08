# Contributing to TrailBuddy

Thanks for helping people get outside. TrailBuddy is a small project, so contributions of any size are welcome.

## Reporting issues

Open a GitHub issue with: what you did, what you expected, what happened, your OS, Node version, and the output of `ollama list`. Do not paste anything private.

## Suggesting features

Open an issue describing the problem first, not just the solution. Keep the project's idea in mind: AI prepares the experience, then the user puts the phone away. Features that keep people on screens outdoors are a poor fit.

## Improving prompts

The prompt lives in `server/prompts/adventurePrompt.js`. If you change it, include a few before/after outputs from Gemma in your pull request (ideally for different moods), and keep the safety rules (no invented places, no safety claims about locations, no dangerous instructions, no screen use outdoors).

## Adding outdoor activities

1. Add the value to `ACTIVITIES` in `server/validation/adventureRequest.js`.
2. Add guidance for it in `ACTIVITY_GUIDE` in `server/prompts/adventurePrompt.js`.
3. Add a matching option in `client/src/options.js`.
4. Add or update a test in `server/validation/adventureRequest.test.js`.

Moods and difficulties follow the same pattern.

## Adding future model support

Model communication is isolated in `server/services/ollama.js`, and the model name comes from `OLLAMA_MODEL`. Open an issue before adding other model families so we can discuss keeping the project local and open-weight.

## Development

```
npm run install:all
npm test
```

Keep changes small and focused, and update the docs if behavior changes.