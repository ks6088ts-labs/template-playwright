# Repository Guidelines

## Repository Purpose

This repository contains documentation, examples, test plans, and Playwright
tests for Playwright CLI and Playwright Test Agent workflows. It is a private
pnpm project, not a package intended for publication.

- Run commands from the repository root.
- Keep changes focused and preserve existing user work.
- Keep examples, plans, tests, and their referenced paths consistent.

## Toolchain and Dependencies

- Use Node.js 20 or newer and a current pnpm release.
- Install committed dependencies with `pnpm install --frozen-lockfile`.
- Use pnpm exclusively. Do not substitute npm or yarn for repository commands.
- Invoke project-local tools through package scripts or `pnpm exec`:
  - Playwright CLI: `pnpm run pw -- <command>` or `pnpm exec playwright-cli`
  - Playwright Test: `pnpm exec playwright test`
- Do not install Playwright CLI globally or use `pnpm dlx` for repository work.
- Make dependency upgrades deliberately. Update `package.json` and
  `pnpm-lock.yaml` together, and never hand-edit or delete the lockfile to fix an
  installation problem.

See [docs/project-setup.md](docs/project-setup.md) for setup and upgrade details.

## Repository Layout

- `tests/` contains Playwright Test files; `tests/seed.spec.ts` is the seed used
  by the agent-assisted planning and generation examples.
- `specs/` contains Markdown test plans.
- `docs/` and the root `README.md` are the canonical English documentation.
- Same-directory `*.ja.md` files are generated Japanese translations.
- `.github/agents/` contains the checked-in Playwright planner, generator, and
  healer definitions. Do not regenerate or broadly edit them unless the task is
  an intentional Playwright upgrade.

Do not commit local browser state, credentials, reports, traces, screenshots, or
other generated output. In particular, keep `.playwright-cli/`,
`.playwright-mcp/`, `artifacts/`, `test-results/`, `playwright-report/`,
`blob-report/`, and `playwright/.auth/` out of changes.

One deliberate exception: a scenario may publish curated screenshots as
documentation. The reviewed images under
`docs/scenarios/create-screenshot-guide/sample-guide/images/` are committed on
purpose and are referenced by that scenario's Markdown. This exception covers
only such reviewed, referenced images — never raw or transient capture output.

## Playwright Test Conventions

- Test observable user behavior, and keep scenarios independent so they can run
  in any order with a fresh browser context.
- Prefer role, label, text, and other user-facing locators. Avoid brittle CSS,
  XPath, and DOM-position selectors.
- Use Playwright's retrying web-first assertions instead of manual polling,
  arbitrary sleeps, or `networkidle` waits.
- Represent genuinely dynamic content with a narrowly scoped pattern rather
  than a fixed transient value.
- Do not weaken assertions, add broad timeouts, or skip a test merely to make a
  failure pass. Diagnose whether the test, target site, or environment changed.
- The sample target is a third-party public site. Keep interactions read-only
  and report network or site availability problems as environmental blockers.

For tests generated from a plan, preserve the conventions demonstrated by
`tests/homepage/hero-content.spec.ts`: one scenario per file, matching `spec` and
`seed` headers, a `test.describe` matching the plan group, the scenario title as
the test title, and one numbered plan-step comment before each implemented step.
See [docs/scenarios/playwright-test-agents/README.md](docs/scenarios/playwright-test-agents/README.md)
for the complete planner-generator-healer workflow.

## Documentation and Japanese Translations

- Edit the English source first. Do not treat a `*.ja.md` file as canonical.
- When changing `README.md` or an English file under `docs/`, update its
  same-directory Japanese sibling in the same change.
- Use the `translate-markdown-ja` skill in `.agents/skills/translate-markdown-ja/`
  and preserve code blocks, commands, paths, identifiers, URLs, version strings,
  literal UI text, evidence, and template tokens exactly as required by the
  translation rules.
- Prefer links to existing documentation over duplicating long instructions.

## Validation

Run the narrowest relevant check first, then expand when the change warrants it.

```sh
# One Playwright test on the shortest feedback-loop browser
pnpm exec playwright test tests/path/to/example.spec.ts --project=chromium

# Full suite across configured Chromium, Firefox, and WebKit projects
pnpm exec playwright test

# Documentation translation checks
pnpm run test:docs-i18n
pnpm run docs:i18n:check
pnpm run docs:i18n:status

# Whitespace and conflict-marker check for all changes
git diff --check
```

Install missing test browsers with `pnpm exec playwright install` or the CLI's
managed browser with `pnpm run pw:install-browser`, depending on the workflow.
State clearly when a check could not run because the browser, network, or target
site was unavailable.
