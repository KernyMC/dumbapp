# Decisions

- Nessie's interactive docs at `http://api.nessieisreal.com/documentation` returned `Missing Authentication Token` without a browser session. Request fields were checked against `nessie-python-sdk`: customers use `first_name`, `last_name`, and address `zip` (not `zipcode`); accounts use `type`, `nickname`, `rewards`, `balance`; create responses put the id in `objectCreated._id`; account reads return `balance`. Purchases follow that same snake_case shape from the plan: `merchant_id`, `medium`, `purchase_date`, `amount`, `description`.
- No alarm mp3 is shipped. `AlarmClock` loops a WebAudio square wave, which is the fallback in T004 and needs no extra binary.
- Missing Nessie, ElevenLabs, or Anthropic keys take the mock path even when `DEMO_MOCK=false`. `DEMO_MOCK=true` forces mocks when keys are present. One failed Nessie call sticks the process to the in-memory ledger so the receipt and the dashboard cannot disagree.
- Sleep points are `floor(dollars spent * 10)` from the purchase list, so they match the invoices instead of a second counter.
- `reactStrictMode` is off so the alarm voice and the 20s snooze timer do not double-fire in dev.
- Surprise fees are only the two named in the spec, one or two of them at random. Cancellation charges only the $2.99 fee.
- Snooze prices the server will accept are `$0.99 * 2^n`. Anything else bills `$0.99`.
- The 60–90s backup video is not in the repo. Record it from the demo script in the README on the laptop that will go on stage.
- UI copy is English because the spec, Brenda, and the LLM judge are English.
