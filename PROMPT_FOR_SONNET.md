# Prompt for Claude Code (Sonnet)

Open Claude Code inside the `snoozeflix/` folder and paste everything below:

---

You are building **SnoozeFlix**, a hackathon joke app (MHacks 2026). Read these files first, in order, and treat them as the source of truth:

1. `.specify/memory/constitution.md`
2. `specs/001-snoozeflix/spec.md`
3. `specs/001-snoozeflix/plan.md`
4. `specs/001-snoozeflix/tasks.md`

Then implement `tasks.md` phase by phase, top to bottom:
- Check off each task (`- [x]`) in `tasks.md` as you finish it.
- After each phase, run `npm run build` and fix all errors before moving on.
- Before writing `src/lib/nessie.ts`, fetch the Nessie docs at http://api.nessieisreal.com/documentation and confirm request/response field names. Adjust the plan if they differ.
- Every external call must have the mock fallback described in plan.md. With `DEMO_MOCK=true` the app must work with no API keys at all.
- Keep API keys server-side only.
- Do not ask me questions unless something is truly blocking; make a reasonable choice and note it in a `DECISIONS.md` file.
- Stop after Phase 3 checkpoint and tell me how to test it, then continue with Phases 4–6.

My `.env.local` will contain: NESSIE_API_KEY, ELEVENLABS_API_KEY, ANTHROPIC_API_KEY, and the voice IDs. Run `npm run setup:nessie` after Phase 1 and tell me which IDs to paste.
