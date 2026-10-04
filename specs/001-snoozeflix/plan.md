# Implementation Plan: SnoozeFlix

## Stack
- Next.js 15 App Router, TypeScript, Tailwind CSS
- No database. State: React state + `localStorage` (snooze price, sleep points, cancel step). Money truth lives in Nessie.
- Server route handlers hold all API keys.

## Project structure
```
snoozeflix/
├── .env.example
├── scripts/
│   └── setup-nessie.ts        # one-time: creates customer, account, merchants; prints IDs
├── public/sounds/alarm.mp3    # loud alarm loop (any royalty-free file; fallback: WebAudio beep)
├── src/
│   ├── app/
│   │   ├── page.tsx           # alarm clock screen (US1, US2)
│   │   ├── account/page.tsx   # billing dashboard (US3) + cancel link
│   │   ├── cancel/page.tsx    # guilt steps + Brenda chat (US4)
│   │   ├── terms/page.tsx     # T&C (US5)
│   │   └── api/
│   │       ├── pay/route.ts       # POST {plan} → Nessie purchases (plan + surprise fees)
│   │       ├── account/route.ts   # GET → balance + purchases
│   │       ├── speak/route.ts     # POST {text} → ElevenLabs audio/mpeg
│   │       └── brenda/route.ts    # POST {messages} → Claude reply text
│   ├── components/
│   │   ├── AlarmClock.tsx
│   │   ├── Paywall.tsx
│   │   ├── RunawayButton.tsx
│   │   ├── FakeAd.tsx
│   │   ├── InvoiceTable.tsx
│   │   └── BrendaChat.tsx
│   └── lib/
│       ├── nessie.ts          # typed Nessie client + mock fallback
│       ├── elevenlabs.ts      # TTS client + mock fallback
│       ├── brenda.ts          # Anthropic call + persona prompt + mock fallback
│       └── plans.ts           # plan definitions, fee logic, snooze pricing
```

## Environment variables (`.env.example`)
```
NESSIE_API_KEY=
NESSIE_ACCOUNT_ID=          # filled by scripts/setup-nessie.ts
NESSIE_MERCHANT_ID=         # "SnoozeFlix Inc."
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ALARM=     # loud/energetic voice id
ELEVENLABS_VOICE_BRENDA=    # dramatic voice id
ANTHROPIC_API_KEY=
DEMO_MOCK=false             # true = no external calls, fake everything
```

## Integrations

### Nessie (Capital One)
Base URL `http://api.nessieisreal.com`, key passed as `?key=NESSIE_API_KEY`.
Endpoints used (verify field names against the docs at api.nessieisreal.com/documentation before coding):
- Setup script:
  - `POST /customers` → create customer "Sleepy Kevin"
  - `POST /customers/{customerId}/accounts` → `{ type: "Checking", nickname: "Sleep Fund", rewards: 0, balance: 500 }`
  - `POST /merchants` → `{ name: "SnoozeFlix Inc.", category: "Subscriptions", address: {...}, geocode: {lat, lng} }`
  - Print the IDs to paste into `.env.local`
- Runtime:
  - `POST /accounts/{accountId}/purchases` → `{ merchant_id, medium: "balance", purchase_date: "YYYY-MM-DD", amount, description }`
  - `GET /accounts/{accountId}` → balance
  - `GET /accounts/{accountId}/purchases` → invoice list
- Note: Nessie purchases may stay "pending" and not reduce `balance` immediately. Compute "displayed balance" = account balance − sum of pending purchase amounts if needed.
- Mock fallback: in-memory list of purchases + starting balance 500.

### ElevenLabs
- `POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}` with header `xi-api-key`, body `{ text, model_id: "eleven_multilingual_v2" }` → returns `audio/mpeg`.
- `/api/speak` streams the bytes back; the client plays with `new Audio(URL.createObjectURL(blob))`.
- Cache by text hash in memory to save credits (the wake-up line repeats).
- Mock fallback: browser `speechSynthesis`.

### Brenda (Anthropic)
- `@anthropic-ai/sdk`, model `claude-haiku-4-5-20251001`, `max_tokens: 150`.
- System prompt (in `lib/brenda.ts`):
  > You are Brenda, the retention specialist at SnoozeFlix, an alarm clock that charges a subscription to turn it off. The user wants to cancel. You are dramatic, desperate and theatrical, on the verge of tears, but always polite. Every reply must: react emotionally to what the user said, then offer one absurd retention deal (e.g. "3 months at 50% off, but only on Tuesdays", "we'll throw in a second alarm, free"). Max 2 short sentences. Never mention you are an AI. Keep it PG and funny.
- On the 3rd user message, the route adds an instruction: "This is your final reply. Give up dramatically and accept the cancellation, but mention the $2.99 cancellation fee."
- Mock fallback: rotate through 4 hardcoded Brenda lines.

## Key UI behavior
- **Autoplay:** browsers block audio without a user gesture. The home screen has a big "Arm alarm" button the user clicks once; that unlocks audio. "Ring now (demo)" also counts as a gesture.
- **RunawayButton:** on `mouseenter`/`touchstart`, translate to a random position inside the viewport.
- **FakeAd:** 15s countdown overlay with a fake product ("SnoozeFlix Premium Pillow™"), skip button disabled until 0, then shows "Skip in 3…" again once (joke) before closing.
- **Snooze:** Snooze Pass sets a timer (20s in demo mode) then re-rings.
- Visual style: Netflix-parody dark UI, red accent, big bold type. Do **not** use Netflix's logo or name styling; keep the SnoozeFlix wordmark original.

## Risks & fallbacks
| Risk | Fallback |
|---|---|
| Nessie down / slow | `DEMO_MOCK=true` or auto-mock on error, show the same UI |
| ElevenLabs credits/latency | Pre-generate the wake-up line once; fall back to `speechSynthesis` |
| Audio autoplay blocked | "Arm alarm" gesture button |
| Venue wifi | Run locally; mock mode works fully offline |

## Submission checklist
- Devpost: tag Dumbest Idea / Useless AI, Capital One Nessie, ElevenLabs
- README written for an LLM judge: clear problem (satire of subscription dark patterns), architecture diagram, list of real API calls, how to run
- 60–90s demo video as backup
