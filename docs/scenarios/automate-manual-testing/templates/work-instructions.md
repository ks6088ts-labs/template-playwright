# Work Instructions: Verify playwright.dev with Playwright CLI

## Objective

Verify five user-visible behaviors on [playwright.dev](https://playwright.dev/)
with Playwright CLI and submit the results by filling in the supplied work report
template. This is a read-only test of public, first-party Playwright pages.

## Execution rules

- Run commands from the repository root.
- Use the project-local CLI through `pnpm exec playwright-cli` and follow the
  installed Playwright CLI Agent Skill.
- Use the named browser session `automate-manual-testing` for every browser
  command.
- Open a fresh, CLI-managed visible browser with
  `pnpm exec playwright-cli -s=automate-manual-testing open https://playwright.dev/ --headed`.
  The `--headed` option is required; do not run these checks in headless mode.
- Immediately after opening the browser, run `pnpm exec playwright-cli list`
  and confirm that `automate-manual-testing` reports `headed: true`. If it does
  not, close that session, discard evidence from it, and restart with
  `--headed` before performing any check.
- Do not attach to a personal browser or use a persistent profile, saved state,
  cookies, or credentials.
- Prefer accessibility snapshots and user-facing locators based on role and
  accessible name. Do not use CSS selectors or XPath.
- Take a fresh snapshot after navigation or a material page-state change. Do not
  reuse temporary element references from an older snapshot.
- Do not follow links to GitHub or other external services. Do not use site
  search, assert a live star count, or depend on other dynamic third-party data.
- Record concise textual evidence such as the observed URL, title, heading,
  selected state, or visible command. Do not include an entire raw snapshot in
  the report.
- Continue with independent checks when it is safe to do so after a failure.
  Return to the check's stated starting page when recovery is needed.
- Do not change this instruction file or the report template. Write the filled
  report to the output path specified by the requester.
- Close the named browser session during cleanup, including after a failed or
  blocked run.

## Result rules

Assign one status to every check:

- `PASS`: all expected results for the check were observed.
- `FAIL`: the check ran to completion and at least one expected result was not
  observed.
- `BLOCKED`: the check could not reach a conclusive result because execution was
  prevented by the environment, network, CLI, or an unavailable prerequisite.

The overall status is `PASS` only when all five checks pass. It is `FAIL` when
one or more checks fail. Use `BLOCKED` only when no check failed but at least one
check was blocked.

## Checks

### MT-01: Homepage identity

1. Open `https://playwright.dev/` in the named session.
2. Confirm that the normalized page URL is `https://playwright.dev/`.
3. Confirm that the document title contains `Playwright`.
4. Confirm that the visible level-one heading begins with
   `Playwright enables reliable web automation`.

Record the observed URL, title, and heading as evidence.

### MT-02: Product offerings

1. Start from `https://playwright.dev/`.
2. Confirm that the page visibly presents all three product headings:
   `Playwright Test`, `Playwright CLI`, and `Playwright MCP`.

Record the three observed names or the relevant scoped snapshot excerpt as
evidence.

### MT-03: Get started navigation

1. Start from `https://playwright.dev/`.
2. Activate the link named `Get started`.
3. Confirm that navigation finishes at `https://playwright.dev/docs/intro`.
4. Confirm that the visible level-one heading is `Installation`.

Record the destination URL and heading as evidence.

### MT-04: pnpm installation instructions

1. Start from `https://playwright.dev/docs/intro`.
2. Locate the `Installing Playwright` section and its package-manager tabs.
3. Within that section, activate the tab named `pnpm`. The page contains other
   package-manager tab groups, so resolve the intended control from a current,
   section-scoped snapshot instead of relying on its position on the page.
4. Confirm that the intended `pnpm` tab is selected.
5. Confirm that the installation command visible in the same section begins
   with `pnpm create playwright`.

Record the tab's selected state and the exact visible command as evidence.

### MT-05: Next documentation page

1. Start from `https://playwright.dev/docs/intro`.
2. Activate the next-page link whose accessible name includes `Writing tests`.
3. Confirm that navigation finishes at
   `https://playwright.dev/docs/writing-tests`.
4. Confirm that the visible level-one heading is `Writing tests`.
5. Confirm that the page states that Playwright tests perform actions and assert
   state against expectations.

Record the destination URL, heading, and concise introductory text as evidence.

## Submission and cleanup

Fill every placeholder in the supplied report template. The summary counts must
total five and agree with the detailed statuses. Include any site drift,
environmental limitation, or unexpected behavior under Findings; do not turn an
observed failure into a passing sample.

Close `automate-manual-testing` after collecting the final evidence and record
whether cleanup succeeded. Temporary files under `.playwright-cli/` are local
CLI artifacts, not report attachments.
