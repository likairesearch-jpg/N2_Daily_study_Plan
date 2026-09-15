# Reference pipeline

The formal course contract remains `docs/COURSE_SCHEMA.md`. Formal input stays at `data/weekXX.json`; reference refresh cannot write those files, their index, version.json, or learner progress. Week03 is intentionally on hold.

## Commands

```powershell
node tools/reference.cjs update
node tools/reference.cjs update --offline
node tools/reference.cjs validate
node tools/reference.cjs query --type=vocab --level=N2 --limit=5
node tools/reference.cjs query --type=grammar --level=N2 --review --limit=5
node tools/reference.cjs coverage
```

Equivalent npm commands: refs:update, refs:validate, refs:query (pass arguments after --), stats:coverage. No npm command is needed after the existing dependencies are installed.

## Refresh and license gate

The updater clones missing GitHub repositories shallowly into .cache/reference-sources, or fetches and fast-forwards existing clean caches. It never executes upstream scripts, installs their dependencies, or scrapes entire websites. A changed license/provenance file or license-file inventory blocks refresh pending a new audit. Do not update the policy hashes simply to bypass an error.

sources/policy.json contains the human-reviewed permissions, exact evidence hashes, allowed import scope and branches. sources/registry.json records actual pinned commits and fetch times. Unchanged revisions reuse their fetch timestamp, so repeated updates are deterministic.

Git/network/parse/schema/attribution failures preserve the last complete data snapshot. A failed operation returns a nonzero exit code. Stale .update.lock recovery: confirm its PID is no longer running before removing only that lock file.

## Reading data

Start from data/reference/index.json. It points to an immutable snapshots/<hash>/ directory containing vocab, kanji, grammar, examples and metadata. Commit the pointer only after all data and notices have been validated. Previous snapshots can remain for rollback; do not edit a snapshot in place.

Each category contains records.json. IDs derive from normalized identity, not array position. Vocabulary with different readings remains distinct; matching surfaces are flagged for review. Grammar grouping normalizes wave markers and spacing, not grammatical meaning.

Every record retains source-specific variants, JLPT labels by source, exact upstream revision/file/row, license and attribution. Different meanings/structures/readings are review flags, not claims that either source is wrong. Shared JMdict/KANJIDIC/Waller ancestry does not count as independent corroboration. Primary display fields follow stable adapter order (OpenJLPT then nihongo-mono); variants preserve alternatives and conflicts are explicit.

Missing readings stay null and are flagged, never invented. English meanings come from upstream. No Chinese translations or formal lessons are generated. Example JLPT tags are inherited from their associated vocabulary/grammar, not a separately assessed sentence difficulty.

Normalized combined data is distributed under CC BY-SA 4.0, with MIT notices retained for nihongo-mono grammar and upstream notices for EDRDG, Waller and Tatoeba. See metadata/ATTRIBUTION.md and metadata/licenses within each snapshot. Sources without adequate redistribution evidence remain manual links only.

## Work usage and statistics

Use --level=N2 for primary candidates, N5/N4/N3 for prerequisites and N1 for optional extension. --review filters issues. Source commonness/frequency values remain source-specific, with null where unavailable.

Coverage is an approximate text match against formal course fields, not learner mastery. Kanji formal coverage is null because the existing curriculum does not explicitly record standalone kanji instruction. Do not turn incidental appearances into learned kanji or invent personal red/yellow results.

Reference JSON is available in the repository for Work, but excluded from the learner Pages bundle to keep the PWA light. The course watcher does not auto-commit reference files. Refresh via one command; reviewed reference changes are validated in CI alongside engineering releases.

## Future maintenance

A license change requires a fresh source review. An upstream format change requires an adapter change and tests. These are intentional stops, not permission to silently import unknown content.

## Local candidate queries and network boundary

Work must query small batches locally; do not read whole records.json files into the conversation and do not refresh/download references for each Week. The program reads the local snapshot in its own process; only bounded selected records enter Work's context. Default 10, maximum 50 per query; paginate with --offset=10. Normal local generation does not require GitHub access.

`node tools/reference.cjs query --type=vocab --level=N2 --covered=false --conflict=false --confidence=medium --limit=10`

Filters: --type=vocab|kanji|grammar|examples, --level=N5..N1 (any source label), --keyword=text (or a positional keyword), --confidence=medium|review|high|low, --conflict=true|false, --covered=true|false, --id=stable-id. --review is an alias for --confidence=review. Actual current sources use medium/review; asking for high may return zero. Resolve example IDs with --id=... --type=examples --limit=1.

Covered means surface matched in formal Day001 and weekly vocabulary/grammar, not personal mastery. It cannot distinguish all homographs/senses. --covered requires vocab or grammar; kanji/examples have no reliable formal coverage and return null instead of falsely claiming unlearned. Personal browser progress is separate and inaccessible to this tool.

Storage: data/reference/index.json points to data/reference/snapshots/<version>/{vocab,kanji,grammar,examples}/records.json and metadata. All standardized records already exist locally. .cache/reference-sources/ contains ignored upstream clones.

No network: query, coverage, validate, update --offline, sync status/start/stop. Internet: reference update without --offline clones/fetches upstream; sync once and the daily task fetch/push the course repository (even no-change sync checks remote state); GitHub Actions performs cloud build/deploy; learner App fetches Pages updates. A reference refresh is explicit, never part of the daily course task. Work should only request a refresh if separately instructed or the local library lacks needed data, and must report missing candidates rather than invent a source.

## Windows management window

Double-click **N2 Sync Manager.vbs** in the project folder. No terminal commands are needed. Buttons: sync courses now, stop/start daily course sync, show sync status, manually update Reference, and show local Reference snapshot/source information. Closing the window leaves the daily task enabled unless you stopped it. Course sync runs daily at 16:00 Windows local time (currently Japan). Reference has NO scheduled refresh. The learner App does not download the reference library; Work uses local bounded queries.

Reference update is explicitly manual: GUI button, or `node tools/reference.cjs update` / `npm run refs:update`. Latest snapshot is in `data/reference/index.json`, and commit/version/fetchedAt are in its `metadata/registry.json` and `sources/registry.json`; the GUI Reference info button displays them. fetchedAt stays unchanged when the pinned upstream commit stays unchanged. Failures or changed license/attribution evidence leave the last usable snapshot intact.
