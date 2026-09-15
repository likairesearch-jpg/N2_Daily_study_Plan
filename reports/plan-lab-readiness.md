# Plan Lab development verification

Branch: feature/plan-lab-v1. Separate worktree: .worktrees/plan-lab. Do not merge or deploy main without user approval.

Baseline dea9dc8 preserves the user's existing validated Week03; no Week01-03 teaching text was edited. No Week04 or real Experiment Course was generated.

Implemented: persisted validated Profiles with protected official deletion; two-tab manager with CRUD; immutable Profile context snapshots; N2-only coverage/forecasts; local client dictionary; level/conflict badges; per-sentence reading TTS; separate full-example audio and token details; approved experiments with isolated storage. Profile edits are outside automatic publication allowlists. Reference remains manually refreshed only.

Official Default mirrors Week03 daily targets: 12 vocabulary, 3 grammar, 2 reading questions, 1 listening question. Experiment presets: balanced, vocabulary 18, grammar 5. These settings generate no teaching content by themselves.

N2 any-source candidates: vocabulary 2518 (67 stable-ID/unique-match covered, 2451 unconfirmed); grammar 225 (26 covered, 199 unconfirmed); kanji 367, formal instructional coverage unknown. Historical unmatched items remain review-required. At 82 pre-exam days: 12/15/18/20 daily new words yield optimistic capacities 984/1230/1476/1640.

Local tests passed: Profile CRUD/protection/schema/hash, actual WinForms save+reread including Chinese, immutable context parameters, isolated experiment promotion, original renderer/navigation/progress, safe Git synchronization, reference safety, browser badges/sentence/audio/token details, official-vs-experiment progress isolation, PWA/offline/hash fallback. Final feature CI pending.

Client dictionary is approximately 1MB/900 entries, restricted to course occurrences and taught items; full reference never ships. Chinese meanings are only supplied course meanings; missing meanings are labeled unavailable and English source meanings are identified. Existing historical collocations are not rewritten into invented sentences; new future/experiment vocabulary requires examples[].

Experiment data is tested only in temporary checkouts/dist fixtures and cleaned afterward. No public experiment is live on Pages until the user approves merging this feature and Work supplies/promotes an Experiment Course.

Profile paths: config/profiles/*.json; active selection: config/active-profile.json; schema: schemas/plan-profile.schema.json and docs/PLAN_PROFILE_SCHEMA.md. Work Context contains profileId/name/mode/path/schemaVersion/hash and parameters. All generation remains Work's responsibility.
