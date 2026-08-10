---
name: Playwright Release Watch
description: Weekly check for new Playwright, Playwright CLI, and Playwright MCP releases; opens a single structured issue when a new version ships.
on:
  schedule:
    # Fuzzy weekly schedule: Monday at a deterministic, load-distributed time.
    - cron: "weekly on monday"
  workflow_dispatch:
permissions:
  contents: read
  issues: read
strict: true
engine: copilot
network:
  allowed:
    - defaults
    - github
    - node
    - "playwright.dev"
tools:
  github:
    mode: gh-proxy
    toolsets: [repos, issues]
  web-fetch:
  cache-memory:
    allowed-extensions: [".json"]
safe-outputs:
  create-issue:
    title-prefix: "[release-watch] "
    labels: [release-watch, dependencies]
    max: 1
    deduplicate-by-title: true
---

# Playwright Release Watch

You monitor upstream releases for the Playwright tools this repository cares about and
report new versions as a single, well-structured GitHub issue. You run on a weekly
schedule and on manual dispatch. You have read-only access; the issue is created for you
through the safe-outputs mechanism, so you never write to the repository directly.

## Tools to monitor

| Tool | GitHub repository | npm packages |
| --- | --- | --- |
| Playwright | `microsoft/playwright` | `playwright`, `@playwright/test` |
| Playwright CLI | `microsoft/playwright-cli` | `@playwright/cli` |
| Playwright MCP | `microsoft/playwright-mcp` | `@playwright/mcp` |

## State file (cache memory)

Persistent state lives at `/tmp/gh-aw/cache-memory/last-seen.json`. It records the most
recent release you have already reported for each repository, for example:

```json
{
  "microsoft/playwright": "1.62.1",
  "microsoft/playwright-cli": "0.1.17",
  "microsoft/playwright-mcp": "0.0.39",
  "updated_at": "2026-08-04T03:00:00Z"
}
```

## Steps

1. Read `/tmp/gh-aw/cache-memory/last-seen.json`. If it does not exist, treat this as the
   first run: there is no previously seen version for any tool.
2. For each tool, find the latest published release:
   - Prefer the GitHub tools: list releases for the repository and take the most recent
     release that is not a draft and not a pre-release. Record its tag/version, publish
     date, and body (the changelog notes).
   - If GitHub release data is unavailable for a tool, fall back to `web-fetch`:
     - Playwright: `https://playwright.dev/docs/release-notes` and
       `https://github.com/microsoft/playwright/releases.atom`
     - Playwright CLI: `https://github.com/microsoft/playwright-cli/releases.atom`
     - Playwright MCP: `https://github.com/microsoft/playwright-mcp/releases.atom`
3. Read this repository's `package.json` and note the pinned versions of `@playwright/test`
   and `@playwright/cli`. `@playwright/test` tracks the same version line as `playwright`,
   so a new Playwright release maps to a possible `@playwright/test` upgrade.
4. Compare each tool's latest version with the value in the state file. A tool is **new**
   when its latest version differs from the recorded value, or when there is no recorded
   value (first run).
5. Decide the outcome:
   - If no tool has a new version, you MUST call the `noop` tool with a short message such
     as `{"noop": {"message": "No new Playwright releases since last run."}}` and stop.
     Do not create an issue.
   - Otherwise, first search existing open issues whose title starts with
     `New Playwright releases:` to avoid duplicating a report for the same versions. If an
     equivalent report already exists, call `noop` instead of creating a duplicate.
6. When at least one tool is new, create exactly one issue using the structure below.
7. Update `/tmp/gh-aw/cache-memory/last-seen.json` so every tool records its latest version
   and `updated_at` is set to the current UTC timestamp. Write valid JSON only.

## Issue structure

Title - the `[release-watch]` prefix (with a trailing space) is added automatically:
`New Playwright releases: <tool> <version>[, <tool> <version> ...]`, listing only the tools
that changed.

Body:

- A short intro sentence naming the tools that have new releases.
- A `## Summary` section with this table (include a row only for tools that changed; use
  `-` when there is no previously seen version):

  | Tool | Repository | Previous | Latest | Released |
  | --- | --- | --- | --- | --- |

- One `## <tool> - <version>` section per changed tool, containing:
  - **Released:** the publish date (YYYY-MM-DD).
  - **Source:** a link to the GitHub release (or the release-notes page).
  - **Pinned in this repo:** the current pinned version when this repo depends on the
    package (`@playwright/test` for Playwright, `@playwright/cli` for Playwright CLI) and
    whether an upgrade is worth considering. Write "Not a direct dependency" for
    Playwright MCP.
  - **Highlights:** 3-6 bullets summarizing user-visible features, fixes, and notable
    changes from the changelog.
  - **Breaking changes / upgrade notes:** bullets, or "None noted."
- A `## Review checklist` section with these items:
  - `- [ ] Confirm the highlights against the linked changelog.`
  - `- [ ] Decide whether to upgrade the pinned dependencies (@playwright/test, @playwright/cli).`
  - `- [ ] If upgrading, update package.json and pnpm-lock.yaml together and do not hand-edit the lockfile (see AGENTS.md).`
  - `- [ ] Check whether docs, specs, or tests reference changed behavior.`
- A closing note that this report was generated automatically and should be verified
  before acting on it.

Keep the body factual and concise. Only include information you actually retrieved. If a
changelog is unavailable for a tool, say so rather than inventing details.
