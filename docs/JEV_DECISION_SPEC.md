# Jev Decision Spec v1 in Mashups

Mashups uses Model Prism's `jev-decision-spec/v1` **Rank** primitive in two
places where candidate sets already exist naturally.

Jev does not generate audio, decide rights, or pretend to hear a render.

## 1. AI production suggestions

`POST /api/ai/suggest` already generates exactly three production suggestions.

After that existing generation step, Jev can rank the three ideas for:

- usefulness
- actionability
- specificity to the current mashup state
- whether the suggestion appears to depend on new external recorded material

The external-material judgment is triage only. Mashups' rights systems remain
authoritative.

All three suggestions are still returned.

### Modes

```text
MASHUPS_JEV_ENABLED=true
MASHUPS_JEV_SUGGESTION_MODE=assist
MASHUPS_JEV_CONFIDENCE=0.8
```

- **off**: original order
- **shadow**: Jev telemetry, original order
- **assist**: Jev may promote a stronger suggestion but cannot lower its baseline score
- **enforce**: confident Jev ranking may move a weak suggestion down

This preserves the endpoint contract while making the most useful suggestion
surface first.

## 2. Green Room arrangement ranking

The Green Room already has three deterministic, structurally different
arrangement plans:

- A Voice / B Body
- B Voice / A Body
- Phrase-Matched Drop Swap

The server first runs the existing deterministic `assessGreenPair()` compatibility
check. An incompatible pair is rejected **before** any Jev call.

For a compatible pair, Jev ranks the three arrangement plans from metadata only:

- structural promise
- distinctiveness from the other plans
- interpretability as a controlled experiment

Jev is explicitly told not to pretend it can hear the audio.

### Modes

```text
MASHUPS_JEV_ARRANGEMENT_MODE=assist
```

The browser asks `/api/green/arrangement-rank` for an order before local rendering.

If Jev succeeds, the studio renders the highest-ranked arrangement first and
uses it as the default kept candidate when the user has not already chosen one.

**All three arrangements still render.**

If ranking fails, is unavailable, or is denied by billing/tier controls, the
existing deterministic arrangement order is used.

## Cost control

The Green Room ranking endpoint uses Mashups' existing `ai_generations` tier
enforcement and usage finalization. It is not an unmetered public model endpoint.

AI suggestion ranking runs only after the already-metered suggestion generation
call and fails open to the existing order.

## Hard authorities Jev cannot replace

Jev does not control:

- source-track rights
- catalog admission
- sample status
- compatibility rejection
- measured audio quality
- listening keeps
- publication eligibility
- export scope
- watermarks or attribution

Those remain deterministic or human/listening-based.

## Gateway

Hosted Vercel deployments can use `VERCEL_OIDC_TOKEN`.
Local/non-Vercel execution can use `AI_GATEWAY_API_KEY`.

Requests use:

- `typesafe-ai/jev`
- native Vercel `/v1/evaluate`
- Zero Data Retention
- TypeSafe-only routing
- `jev-decision-spec-v1` tag

## Telemetry

Each ranked candidate may include a v1 Rank decision with:

- baseline score
- effective score
- mode
- action
- bounded answer
- confidence
- latency
- cost
- generation ID
- evaluator version

This gives Mashups the same fleet-compatible observability as Model Prism,
AutoSweep, NameMint, LuxuryApartments, WorkBrain, and Synthetic Creator Studio.
