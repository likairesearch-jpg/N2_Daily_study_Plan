# Reference source audit

Reference is a LOCAL library and never refreshes on a schedule. Only an explicit GUI click or node tools/reference.cjs update (npm run refs:update) accesses upstream. Local status: node tools/reference.cjs status. Current snapshot: data/reference/index.json; upstream commit/version/fetchedAt: snapshot metadata/registry.json and sources/registry.json. Unchanged upstream keeps its fetchedAt; it is the recorded snapshot source-fetch time, not the last check time. Failed updates and changed license/attribution evidence preserve the previous snapshot and require review.


Generated from the reviewed source policy and pinned upstream revisions. No reference data becomes formal teaching content automatically.

## JLPT Benkyo repository

- Source: https://github.com/kananinirav/jlptbenkyo
- Commit: 526694693365134c423e8e7d90cfad684ff9b370
- License: Unspecified
- Machine import: false; redistribution: false
- Data: manual-reference
- Attribution: JLPT Benkyo repository authors (no data copied)
- Audit: Website link collection; no LICENSE or redistribution grant found. Manual links only.

## AnchorI JLPT Kanji Dictionary

- Source: https://github.com/AnchorI/jlpt-kanji-dictionary
- Commit: 6dc7e6d3d4d5778b27f7f57a770cc5a350b7889c
- License: MIT (repository); dictionary provenance unresolved
- Machine import: false; redistribution: false
- Data: manual-reference
- Attribution: AnchorI JLPT Kanji Dictionary authors (no data copied)
- Audit: MIT notice is present, but dictionary-source attribution and rights chain are not documented. No bulk redistribution approved.

## Japanese JLPT Learner

- Source: https://github.com/hatwarsanskar95-web/japanese-JLPT-learner
- Commit: 48f0d607275e9a1b4d199aaabc0b2f48fae37b03
- License: Unspecified
- Machine import: false; redistribution: false
- Data: manual-reference
- Attribution: Japanese JLPT Learner authors (no data copied)
- Audit: No LICENSE/NOTICE found; linked/bundled PDFs and quizzes are not approved for redistribution.

## Nippon notes

- Source: https://github.com/xinwu-yang/nippon
- Commit: 5c101fbb0e8a985fae3b40b1234969d665b80c15
- License: Unspecified
- Machine import: false; redistribution: false
- Data: manual-reference
- Attribution: Nippon notes authors (no data copied)
- Audit: No LICENSE/NOTICE found. Personal study notes, manual reference only.

## OpenJLPT

- Source: https://github.com/evanclan/OpenJLPT
- Commit: c42fd9fa3777bfc1775446f7c418d549dfd6e4cf
- License: CC-BY-SA-4.0
- Machine import: true; redistribution: true
- Data: vocabulary, kanji, grammar, examples, JLPT metadata
- Attribution: OpenJLPT contributors; EDRDG; Jonathan Waller; Tatoeba
- Audit: Import vocabulary, kanji, examples and grammar seed data. Retain OpenJLPT, EDRDG JMdict/KANJIDIC2, Jonathan Waller and Tatoeba attribution. Grammar is a seed dataset, not complete coverage.

## nihongo mono

- Source: https://github.com/stndaru/nihongo-mono
- Commit: ec0ba4a0ce1611c568b0e4f8a223eb8029249a25
- License: MIT (grammar); CC-BY-SA-4.0 (vocabulary/kanji)
- Machine import: true; redistribution: true
- Data: vocabulary, kanji, grammar, examples, JLPT metadata
- Attribution: Copyright (c) 2026 Stefanus Ndaru Wedhatama; EDRDG; Jonathan Waller; Tatoeba
- Audit: Import only src/data/vocab, verbs, grammar and JLPT-tagged kanji. Grammar explanations/examples declared original MIT; inventory references Bunpro/JLPT Sensei. EDRDG/Waller/Tatoeba lineage retained; no stroke, OCR, IPADIC or names assets imported.

## JLPT Benkyo website

- Source: https://jlptbenkyo.com/
- Commit: web/manual
- License: No bulk redistribution permission established
- Machine import: false; redistribution: false
- Data: manual-reference
- Attribution: JLPT Benkyo website
- Audit: All-rights-reserved website; no open data grant established. Links only; no site mirror.

## JLPT official public study and test-section pages

- Source: https://www.jlpt.jp/e/samples/forlearners.html
- Commit: web/manual
- License: No bulk redistribution permission established
- Machine import: false; redistribution: false
- Data: manual-reference
- Attribution: JLPT official public study and test-section pages
- Audit: Use public sample/test-section pages for human reference only; no questions, audio, workbooks or unpublished tests imported. See https://www.jlpt.jp/e/guideline/testsections.html .

Normalized combined reference records are distributed under CC BY-SA 4.0; original MIT notices remain attached. English meanings are upstream, not generated Chinese translations. JLPT labels are unofficial, and shared upstream lineage does not increase confidence. Grammar pattern matching is conservative; differences are review flags, not corrections. Full evidence and notices are included in each immutable snapshot.
