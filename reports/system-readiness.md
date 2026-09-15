# System readiness

Local verification passed; final GitHub deployment verification pending.

- Formal Week01-02 / Day001-014 unchanged. No Week03 course created.
- Drafts are Git-ignored and excluded from capture/index/build/PWA. Approved weekly hashes in data/publication.json gate sync and CI builds.
- Isolated Week02 fixture passed draft rejection, validation, promotion, deterministic metadata, safe Git commit/push, no duplicate commit and rejection of direct formal edits. No test course is uploaded to Pages. CI runs this rehearsal before building production assets; browser tests exercise update/offline/progress with isolated assets.
- Optional referenceId and provenance validated without rewriting historical courses. Historical map/review reports are reproducible; unresolved entries are not guessed.
- Local context pack generated at reports/work-context.json (<100KB); bounded candidates and unknown learner states.
- UI exposes context/validate/promote, sync controls, local status and explicit Pages-version refresh. Missing historical push or learner data remains unknown.
- Reference is still local/manual-only; no new reference schedule.

Shortest Work workflow: generate context for next Week; read instructions/schema/context/necessary prior Week; write draft; validate; explicitly promote only when complete; use daily 16:00 or GUI sync.

Known limits: matching is conservative; red/yellow/green requires explicit learner-state data, not inferred browser mastery. Provenance validation checks declared fields, not undeclared copying or legal permission. The publication hash protects against accidental edits, not malicious repository writers.
