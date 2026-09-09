# Week 01 import

Formal Day 2–7 are imported as Day 002–007 (2026-08-28 through 2026-09-02). Original Day001 and Week02 data and saved-state identifiers remain unchanged.

week01.json uses schemaVersion 2.1.0 and the existing weekly day fields. legacyDayIds identifies separately loaded Day001. Added module types are source (title and blocks containing text plus Japanese display/tts/lang spans) and responses (instructionsZh and tasks containing prompt/answer). Listening supports questions, instructionsZh and followUps. The existing Week02 schema describes its original version; Week01 additions are checked by tests/week01-integration.cjs.

Source vocabulary counts: 15/12/10/14/12/12. Previously taught words remain present and are marked review. No new lessons or actual mastery results are invented. Source Day002 has no standalone listening, and Day005 has no standalone reading. Day004/005 each retain three immediate-response exercises. Day003 retains the instruction to listen twice.

Day007's original D+7 heading represents cumulative testing; a visible note clarifies actual Day001 D+7 is due on Day008. Scheduled intervals contain no day zero. Original time estimates are retained separately from summed module durations. The stray Korean text in 確保's meaning is removed.

Sources are archived in docs/course-sources/day002.md through day007.md. tools/import-week01.cjs regenerates week01.json from work/week01-sources.json and will overwrite course edits; normal future updates should edit JSON then run tools/build-course-data.cjs. Integration scripts are one-time migrations.

Verification: smoke.cjs, weekly-integration.cjs and week01-integration.cjs passed. These are automated data/rendering checks; actual browser audio has not been listened to.
