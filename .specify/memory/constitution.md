# SnoozeFlix Constitution

## Purpose
SnoozeFlix is a joke hackathon project for MHacks 2026 (Dumbest Idea / Useless AI side quest): an alarm clock you can only turn off by paying for a subscription. It must be **funny on stage** and **technically real** (real Nessie API transactions, real ElevenLabs voice, real LLM agent).

## Principles
1. **Demo first.** Every feature exists to make the 2-minute live demo land. If it isn't visible in the demo, it doesn't get built.
2. **Real integrations, fake stakes.** All payments go through Capital One's Nessie sandbox API (fake money, real API calls). Never touch real payment rails.
3. **Never block the demo.** Every external call (Nessie, ElevenLabs, Anthropic) has a mock fallback behind `DEMO_MOCK=true` or automatic fallback on error. The stage demo must work offline-ish.
4. **Secrets stay server-side.** API keys live only in `.env.local` and are used only in Next.js route handlers. The browser never sees a key.
5. **Small and boring code.** One Next.js app, no database required, no auth. In-memory/session state is fine. Ship in ~6 hours.
6. **Dark-pattern parody, not real harm.** The UI parodies subscription dark patterns. Everything is clearly a joke; no real user data is collected.

## Tech constraints
- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Node 20+
- Deploy target: Vercel (or `npm run dev` on the laptop for the demo)
- External APIs: Nessie (`http://api.nessieisreal.com`), ElevenLabs TTS, Anthropic Messages API (`claude-haiku-4-5-20251001`)
