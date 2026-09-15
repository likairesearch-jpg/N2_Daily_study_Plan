# Current feature status (2026-09-15)

Plan Lab is ready on feature/plan-lab-v1 only; see [Plan Lab verification](plan-lab-readiness.md). Existing formal Week01-03 are preserved. No Week04 or real experiment was generated. Main was not merged or deployed. Sections below describe the earlier infrastructure milestone; their Week03 first-invocation instructions are historical and must not be repeated.

# System readiness

READY FOR WORK

Local verification and GitHub Actions/Pages passed: https://github.com/likairesearch-jpg/N2_Daily_study_Plan/actions/runs/34946996948 .

- Formal Week01-02 / Day001-014 unchanged. No Week03 course created.
- Drafts are Git-ignored and excluded from capture/index/build/PWA. Approved weekly hashes in data/publication.json gate sync and CI builds.
- Isolated Week02 fixture passed draft rejection, validation, promotion, deterministic metadata, safe Git commit/push, no duplicate commit and rejection of direct formal edits. No test course is uploaded to Pages. CI runs this rehearsal before building production assets; browser tests exercise update/offline/progress with isolated assets.
- Optional referenceId and provenance validated without rewriting historical courses. Historical map/review reports are reproducible; unresolved entries are not guessed.
- Local context pack generated at reports/work-context.json (<100KB); bounded candidates and unknown learner states.
- UI exposes context/validate/promote, sync controls, local status and explicit Pages-version refresh. Missing historical push or learner data remains unknown.
- Reference is still local/manual-only; no new reference schedule.

Shortest Work workflow: generate context for next Week; read instructions/schema/context/necessary prior Week; write draft; validate; explicitly promote only when complete; use daily 16:00 or GUI sync.

Known limits: matching is conservative; red/yellow/green requires explicit learner-state data, not inferred browser mastery. Provenance validation checks declared fields, not undeclared copying or legal permission. The publication hash protects against accidental edits, not malicious repository writers.

## Verified handoff

- Context file: 83162 bytes; 24 unique covered reference IDs, 35 matched item instances and 182 review-required instances.
- Live course version remains 49c4de6eba6928d15ea83ff96c285cb7158631e6e2564345ff503ff3b97c25c5; historical course bytes are unchanged.
- No-change real sync passed after engineering push. Daily task remains ON at 16:00 Japan/local time.
- No production test course or Week03 was created. The isolated test checkout and local Git remote are cleaned after a successful rehearsal.

## First Work invocation

1. Generate the context using the manager (Week=3) or npm run work:context -- --week=3.
2. Ask Work to read WORK_INSTRUCTIONS.md, docs/COURSE_SCHEMA.md, reports/work-context.json and necessary data/week02.json; plan and write only data/drafts/week03.json. This step requires the user to authorize Work generation.
3. When complete, validate then promote through the manager or node tools/workflow.cjs validate --week=3 followed by node tools/workflow.cjs promote --week=3.
4. Use the manager Sync button or wait for daily 16:00.
