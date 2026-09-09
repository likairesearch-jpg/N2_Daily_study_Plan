# N2 Daily App engineering rules

- Work in the ChatGPT “N2 每日冲刺” Project is the sole authority for formal course content. Never invent, extend, correct or rewrite teaching content. Flag editorial problems for Work.
- Preserve existing Day 001 cards and the `n2-daily-v1` browser progress key. Course updates must never clear learner state.
- Week N covers days `(N-1)*7+1` through `N*7`. Week 02 is Day 008–014.
- Work edits `data/weekXX.json`; existing supporting course files are explicitly allowed as documented in docs/COURSE_SCHEMA.md. `data/index.json`, `version.json`, and local JS bundles are generated.
- Use `npm run prepare:course`, `npm test`, and `npm run build` before engineering releases.
- Automatic commits must contain only approved course inputs and generated index/version metadata. Never stage unrelated code, force push, reset, clean, or auto-resolve Git conflicts.
- Keep the desktop-first interface, inline ja-JP speech, offline fallback and installable PWA. No server or native app is needed.
- Never put credentials into source, documentation, logs, or course files.
