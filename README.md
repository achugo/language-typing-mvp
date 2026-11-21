# Typing Language MVP (React + Vite MVP)

A local-browser SPA prototype for a typing-first language learning game.

## Stack

- React 18
- Vite 5
- Browser-only persistence via `localStorage`

## What this MVP includes

- A1 and A2 sentence sets with meaningful English/German content
- Switchable practice direction:
  - English prompt → type German
  - German prompt → type English
- Per-attempt accuracy check
- Local memory for:
  - learned words
  - pending quiz words
  - current level, mode, and sentence index
- Advancement gate:
  - advancement is possible only in English → German mode
  - typing attempt must meet 90%+ accuracy
  - user then must pass new-words quiz at 90%+ to advance from A1 to A2

## Progression rules in this MVP

1. Type a sentence and submit accuracy check.
2. If accuracy is >= 90% and mode is English → German, sentence new words are tracked as learned.
3. Learned words are added to pending quiz words.
4. Quiz unlocks when enough pending words exist.
5. Passing quiz at >= 90% advances the learner to next level.

## Run locally

```bash
npm install
npm run dev
```

Open the local Vite URL shown in terminal (usually `http://localhost:5173`).

## Build check

```bash
npm run build
```

## Notes

- This is intentionally a skeletal, mock-data-only prototype for AI evaluation and iteration.
- No backend and no external API calls.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE).

## Background animation direction (product vision)

To support typing performance without distraction, the preferred direction is a
**calm semantic motion** background.

### Core principle

- Background should reinforce meaning and motivation, but never compete with the
  typing task.
- Motion should stay low-contrast, slow, and predictable.

### Recommended modes

1. **Focus**: near-static minimal visuals.
2. **Balanced** (default): subtle semantic animation linked to sentence topic.
3. **Dynamic**: richer motion for users who prefer a more playful experience.

### Learning-oriented background ideas

- Contextual ambient scenes mapped to topic (travel, weather, work, food).
- Progress-as-path visualization that moves with accuracy and mastery.
- Optional word constellation showing learned vocabulary in subtle form.

### UX guardrails

- Avoid high-speed racing/shooter-like motion during active typing.
- Avoid flashing effects, abrupt camera movement, and aggressive color shifts.
- Provide user control for animation intensity and reduced motion accessibility.

## Next planned demo upgrades

The next iteration for this demo should prioritize:

1. **WPM + mastery badge metrics**
   - Add WPM/typing performance indicators.
   - Introduce a visible mastery badge for completed module thresholds.
2. **Background animation modes**
   - Implement Focus/Balanced/Dynamic background options.
   - Keep Balanced as default with low-distraction behavior.
3. **AI-eval demo flow**
   - Prepare a clean demo flow and screenshots.
   - Document a short runbook for evaluator steps and expected outcomes.
