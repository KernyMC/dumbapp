# Tasks: SnoozeFlix

Format: `[ID] [P?] [Story] Description` — `[P]` = can run in parallel (different files, no dependencies).
Work top to bottom. After each phase, the app must run (`npm run dev`) with no errors.

## Phase 1 — Setup (~30 min)
- [x] T001 Create Next.js 15 app in `snoozeflix/` with TypeScript, Tailwind, App Router, `src/` dir
- [x] T002 Install `@anthropic-ai/sdk`; add `tsx` as dev dependency for scripts
- [x] T003 Create `.env.example` with all variables from plan.md; add `.env.local` to `.gitignore`
- [x] T004 [P] Add `public/sounds/alarm.mp3` (royalty-free) — if none available, implement a WebAudio square-wave beep loop in `AlarmClock.tsx` instead
- [x] T005 Write `scripts/setup-nessie.ts`: create customer, checking account (balance 500), merchant "SnoozeFlix Inc."; print `NESSIE_ACCOUNT_ID` and `NESSIE_MERCHANT_ID`. Add `npm run setup:nessie`

## Phase 2 — Foundation libs (~45 min)
- [x] T006 [P] `src/lib/plans.ts`: plan definitions (Basic, Premium, Snooze Pass, Family), surprise fee generator (1–2 random fees), snooze price doubling helper
- [x] T007 [P] `src/lib/nessie.ts`: `createPurchase(amount, description)`, `getAccount()`, `getPurchases()`; auto-mock when `DEMO_MOCK=true` or on fetch error
- [x] T008 [P] `src/lib/elevenlabs.ts`: `tts(text, voice)` returning ArrayBuffer; in-memory cache; throws to let route fall back
- [x] T009 [P] `src/lib/brenda.ts`: persona system prompt, `brendaReply(messages, isFinal)`; mock lines on error
- [x] T010 API routes: `api/pay` (plan + fees → Nessie purchases, returns receipt), `api/account` (balance + purchases), `api/speak` (audio/mpeg or 503 → client uses speechSynthesis), `api/brenda`

**Checkpoint:** `curl -X POST localhost:3000/api/pay -d '{"plan":"basic"}'` creates purchases visible in `GET /api/account`.

## Phase 3 — US1 + US2: Alarm and paywall (P1, ~2 h) 🎯 MVP
- [x] T011 [US1] `AlarmClock.tsx`: big clock display, time picker, "Arm alarm" button (audio unlock), "Ring now (demo)" button
- [x] T012 [US1] Ringing state: looping alarm sound, flashing red background, call `/api/speak` with wake-up line once per ring
- [x] T013 [P] [US1] `RunawayButton.tsx`: "Dismiss" that jumps to a random spot on hover/touch
- [x] T014 [US2] `Paywall.tsx`: 4 plan cards, Netflix-parody styling, Snooze Pass shows current dynamic price
- [x] T015 [US2] Purchase flow: call `/api/pay`, show loading "Processing your wake-up…", then receipt toast listing plan + surprise fees
- [x] T016 [P] [US2] `FakeAd.tsx`: 15s unskippable ad, then fake "Skip in 3…" once more
- [x] T017 [US2] Plan effects: Basic → ad then stop; Premium → stop + "uses left" counter; Snooze → 20s silence then re-ring + price ×2; Family → stop, then one extra short ring labeled "Ringing your roommate…"

**Checkpoint:** full ring → pay → stop loop works in the browser. This alone is demo-able.

## Phase 4 — US3: Billing dashboard (P1, ~45 min)
- [x] T018 [US3] `account/page.tsx`: balance card, "Total spent waking up", Sleep Points (10/$) with useless "Redeem" button
- [x] T019 [P] [US3] `InvoiceTable.tsx`: purchases from `/api/account`, newest first, fake invoice numbers
- [x] T020 [US3] Tiny grey "Cancel subscription" link at the very bottom

## Phase 5 — US4: Cancel flow + Brenda (P1, ~1.5 h)
- [x] T021 [US4] `cancel/page.tsx`: 4 guilt steps with buttons that swap places between steps
- [x] T022 [US4] `BrendaChat.tsx`: chat UI, Brenda opens with a scripted crying line; each reply from `/api/brenda` is also spoken via `/api/speak` (Brenda voice)
- [x] T023 [US4] After 3 user messages → final Brenda reply → charge "Cancellation Fee $2.99" via `/api/pay` → toast "Subscription cancelled. We'll miss your money." → link back to home

## Phase 6 — Polish & submission (~1 h)
- [x] T024 [P] [US5] `terms/page.tsx` with long joke T&C; checkbox on first purchase
- [x] T025 [P] Landing hero copy + SnoozeFlix original wordmark, favicon
- [x] T026 Demo script verified in the browser on the mock ledger (no keys yet). Repeat it three times on live Nessie once keys are in `.env.local`
- [x] T027 README for LLM judge: problem, satire angle, architecture, real API calls list, run instructions
- [ ] T028 Record 60–90s backup demo video
- [x] T029 (P3, optional) [US6] Leaderboard of shame

## Cut list if behind schedule (cut in this order)
US6 → US5 → Family plan → FakeAd second skip joke → Brenda voice (keep text)
