# Japanese Markdown Translation Rules

## Canonical Source

The English Markdown file is the only canonical version. A Japanese sibling is a
derived document that can be regenerated whenever the English source changes.

- Read the complete English source before translating it.
- Translate from the current English source, not from an older Japanese sibling.
- Do not add a language switcher or any other change to the English source.
- Do not hand-edit the `translation-meta` block. The stamping command owns it.

## Japanese Style

- Use natural, concise Japanese suitable for technical documentation.
- Use the polite `です・ます` style consistently in explanatory prose.
- Preserve the source meaning, requirements, warnings, and degree of certainty.
- Prefer established Japanese technical terms. Keep product names, API names,
  package names, and command names in their official spelling.
- Translate headings, paragraphs, list prose, table labels, blockquotes, and link
  labels unless a rule below protects the text.

## Protected Content

Preserve these items exactly, including spelling and case:

- YAML frontmatter already present in the English source.
- Fenced code blocks, including their info strings, comments, Mermaid source, and
  `text` examples.
- Inline code spans.
- URLs and email addresses.
- File-system paths, command names, command options, package names, identifiers,
  environment variables, and version strings.
- Template placeholders such as `{{FILL_ME}}`.
- Contract tokens such as `PASS`, `FAIL`, `BLOCKED`, and check IDs such as
  `MT-01`.
- Literal UI labels, page titles, headings, commands, or messages that a test
  procedure expects to observe.
- Recorded evidence such as timestamps, counts, browser versions, URLs, observed
  text, result statuses, and cleanup output.
- Existing HTML tags, attributes, comments, and explicit anchors, except for the
  generated `translation-meta` block.

Keep Markdown semantics intact: heading levels, list numbering, task states,
tables, emphasis, blockquotes, and link/image distinction must not change.

## Reports And Test Procedures

Translate narrative instructions and human-readable labels, but do not alter the
contract or evidence represented by the document.

- In a report template, retain every placeholder and allowed status token.
- In a completed report, preserve all observed values and quoted evidence.
- In a test procedure, preserve expected literal UI text. Translate the sentence
  around the literal instead.
- A translated template is still derived documentation. Requests that execute the
  procedure should continue to name the canonical English template path unless
  the requester explicitly asks to execute the Japanese derivative.

## Links And Anchors

For a relative Markdown link in Japanese prose:

1. Resolve the destination relative to the English source.
2. If the destination is an English Markdown source within `README.md` or
   `docs/**` and its Japanese sibling exists or is created in the same batch,
   insert `.ja` before the final `.md`.
3. Otherwise, preserve the destination exactly.
4. Translate the visible link label when it is ordinary prose.

Examples:

```text
docs/setup.md                  -> docs/setup.ja.md
../README.md#usage            -> ../README.ja.md#usage
https://example.com/guide     -> https://example.com/guide
```

Do not localize raw paths in prose, code, commands, or copyable agent prompts.
Only Markdown navigation destinations are eligible.

Preserve every source fragment. When translating a heading changes its automatic
slug, add an explicit anchor immediately before the translated heading:

```markdown
<a id="set-up-an-existing-clone"></a>
## 既存のクローンをセットアップする
```

Do not add an anchor when the translated heading already produces the required
fragment.

## Metadata

The stamping script adds one block near the top of each Japanese sibling:

```text
<!-- translation-meta
source: docs/example.md
sourceHash: sha256:<hash-of-the-English-file>
canonicalLanguage: en
-->
```

If YAML frontmatter exists, metadata follows it. Otherwise, metadata is the first
block. The source hash covers the English file bytes and changes whenever the
canonical document changes.

## Review Checklist

- Read the Japanese document independently for fluency and completeness.
- Compare every heading, paragraph, list item, table row, and blockquote with the
  English source.
- Confirm protected literals and recorded evidence remain exact.
- Confirm Japanese Markdown links target available Japanese siblings and all
  fragments still resolve.
- Run the per-file checker before moving on, then run the full checker after a
  batch.
