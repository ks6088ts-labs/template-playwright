---
name: translate-markdown-ja
description: "Translate canonical English README.md and docs Markdown into Japanese sibling *.ja.md files. Use for Japanese documentation translation, README localization, docs i18n, creating Japanese Markdown, or synchronizing stale Japanese translations while keeping English canonical."
argument-hint: "[README.md, docs/, or specific English Markdown paths; defaults to README.md and docs/]"
---

# Translate Markdown to Japanese

Create or refresh Japanese sibling documents without modifying their canonical
English sources. `example.md` maps to `example.ja.md` in the same directory.

Read [the translation rules](./references/translation-rules.md) before editing a
translation.

## Scope

- With no paths, process the root `README.md` and every English `docs/**/*.md`.
- With paths, process the named English Markdown files or recursively process the
  named directories.
- Exclude existing `*.ja.md` files from the source set.
- Do not translate `.agents/**`, package metadata, licenses, or generated browser
  artifacts unless the requester explicitly expands the scope.

Run every command from the repository root.

## Procedure

1. Inspect the worktree and do not overwrite unrelated or pre-existing user
   changes. English files are read-only inputs for this workflow.
2. List the source/translation pairs and their state:

   ```sh
   node .agents/skills/translate-markdown-ja/scripts/markdown-translations.mjs status --json [paths...]
   ```

3. Handle each state as follows:
   - `current`: leave the translation unchanged.
   - `missing`: create the Japanese sibling from the complete English source.
   - `stale`: retranslate from the complete current English source. Do not treat
     the old Japanese document as canonical.
   - `invalid`: inspect the malformed metadata, then recreate the translation
     from the English source rather than guessing its provenance.
4. For a batch, translate linked leaf documents before navigation or index
   documents. Create every requested Japanese sibling before finalizing links.
5. Translate the prose according to the referenced rules. Preserve the complete
   Markdown structure and all protected literals. Never edit the English source
   to make the translation easier.
6. In Japanese prose, point a relative Markdown link to `*.ja.md` only when that
   Japanese sibling exists or is being created in the same batch. Keep external
   links, raw paths, commands, and paths inside executable prompts unchanged.
7. Stamp each completed translation with its English source path and hash:

   ```sh
   node .agents/skills/translate-markdown-ja/scripts/markdown-translations.mjs stamp path/to/source.md
   ```

8. Validate each changed pair and repair the Japanese file if validation fails:

   ```sh
   node .agents/skills/translate-markdown-ja/scripts/markdown-translations.mjs check path/to/source.md
   ```

9. When processing the default scope, finish with repository-wide checks:

   ```sh
   pnpm run test:docs-i18n
   pnpm run docs:i18n:check
   pnpm run docs:i18n:status
   git diff --check
   ```

10. Review the final diff. Confirm that only Japanese siblings, translation-skill
    files, or explicitly requested supporting files changed, and that every pair
    reports `current`.

## Failure Handling

- Do not stamp an incomplete or unreviewed translation merely to make it appear
  current.
- Fix validation errors in the Japanese sibling. If the English source itself
  contains a broken link or malformed Markdown, report the source problem instead
  of changing the canonical file during translation.
- If an uncommitted target edit cannot be reconciled safely with regeneration,
  stop on that file, explain the conflict, and continue independent files when
  possible.

## Completion Criteria

- Every requested English source has exactly one same-directory `*.ja.md` sibling.
- All requested pairs report `current` and pass the checker.
- Japanese prose is natural and faithful, while protected content is unchanged.
- Links prefer available Japanese siblings and resolve to real files and anchors.
- The English canonical documents remain unchanged by the translation run.
