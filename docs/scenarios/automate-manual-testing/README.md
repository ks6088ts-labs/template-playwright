# Automate a Manual Test Procedure with Playwright CLI

## Purpose

This minimal scenario demonstrates how a coding agent can turn a natural-language
manual test procedure into visible browser actions, verify a public website with
Playwright CLI in headed mode, and submit a structured Markdown work report.

The target is [playwright.dev](https://playwright.dev/). The scenario uses five
read-only checks that cover page identity, visible content, link navigation, a
package-manager tab, and documentation navigation. It does not create a
Playwright Test specification or helper script; the Markdown procedure is the
authoritative test contract.

## Scenario files

| File | Role |
| --- | --- |
| [Work instructions](templates/work-instructions.md) | Natural-language procedure supplied to the agent as context. |
| [Work report template](templates/work-report.md) | Immutable fill-in format supplied to the agent as context. |
| [Sample work report](sample-work-report.md) | Filled report produced from a real run of this demo. |

During a run, keep both files under `templates/` unchanged. Write the completed
report to the output path named in the request. Playwright CLI may create
temporary accessibility snapshots under `.playwright-cli/`; that ignored
directory is not part of the submitted report.

## Prerequisites

- Node.js 20 or newer and pnpm.
- Network access to `https://playwright.dev/`.
- A graphical desktop session where the CLI-managed browser can remain visible.
- A coding agent that can use local Agent Skills and run terminal commands.
- Dependencies and the Playwright CLI browser installed from this repository.

Run all commands from the repository root.

## Step 1: Prepare the project-local CLI

Install the versions locked by the repository and the managed browser:

```sh
pnpm install --frozen-lockfile
pnpm run pw:install-browser
```

Verify the CLI and install its Agent Skill when the environment does not already
provide it:

```sh
pnpm exec playwright-cli --version
pnpm run pw:install-skills
```

The scenario uses `pnpm exec playwright-cli`, so it does not depend on a global
CLI installation.

## Step 2: Review the two context files

Read the [work instructions](templates/work-instructions.md) and
[work report template](templates/work-report.md) before running the demo. The
instructions define exactly five checks, their expected results, evidence
requirements, status rules, and cleanup behavior. The report template defines
the required submission shape.

## Step 3: Ask the agent to execute the procedure

Give both Markdown files to the agent as context. The following request is ready
to use from the repository root:

> Use the Playwright CLI Agent Skill to execute the procedure in
> docs/scenarios/automate-manual-testing/templates/work-instructions.md.
>
> Start the named CLI-managed browser with `--headed`, verify that
> `pnpm exec playwright-cli list` reports `headed: true` before performing any
> check, and do not use evidence from a headless session.
>
> Use docs/scenarios/automate-manual-testing/templates/work-report.md as an immutable
> template and write the filled result to
> docs/scenarios/automate-manual-testing/sample-work-report.md. Base every result on
> observed Playwright CLI evidence, preserve real failures or blockers, fill every
> placeholder, and close the named browser session when finished.

The agent should keep the CLI-managed browser visible throughout the checks and
follow an observe-decide-act-report loop: inspect the current accessibility
snapshot, choose a user-facing locator, perform one action, inspect the resulting
state, and retain only concise evidence for the report. Temporary element
references must not be reused after navigation or a material page-state change.

## Step 4: Review the submitted report

Confirm that the completed report:

1. Contains one result for each check from `MT-01` through `MT-05`.
2. Uses only `PASS`, `FAIL`, or `BLOCKED` for each status.
3. Has summary counts that total five and agree with the detailed results.
4. Contains observed evidence rather than copied expectations.
5. Has no `{{FILL_ME}}` placeholders left.
6. Records successful closure of the `automate-manual-testing` session, or
   explains why cleanup was blocked.
7. Identifies the browser as headed and records that the session reported
  `headed: true` before the checks began.

The checked-in [sample work report](sample-work-report.md) shows the expected
level of detail. It is evidence from one point in time, not a permanent claim
about the live website.

## Success criteria

- The agent derives browser actions from the natural-language instructions.
- All five checks receive a conclusive and evidence-backed status, unless the
  report clearly identifies an environmental blocker.
- The CLI-managed browser is launched with `--headed`, remains visible during
  the checks, and reports `headed: true` before its evidence is accepted.
- The work report template remains unchanged and the filled report is a separate
  Markdown file.
- The named browser session is closed after execution.
- No raw snapshots, screenshots, traces, browser profiles, or credentials are
  added to the scenario directory.

## Troubleshooting

### The CLI or browser is unavailable

Run `pnpm install --frozen-lockfile`, then `pnpm run pw:install-browser`. Confirm
that `pnpm exec playwright-cli --version` succeeds before starting the checks.

### The named session is already open

Close only the session used by this scenario, then restart the procedure:

```sh
pnpm exec playwright-cli -s=automate-manual-testing close
```

### The browser opens in headless mode

Close the session, discard evidence from it, and reopen it explicitly in headed
mode before starting the checks:

```sh
pnpm exec playwright-cli -s=automate-manual-testing close
pnpm exec playwright-cli -s=automate-manual-testing open https://playwright.dev/ --headed
pnpm exec playwright-cli list
```

Continue only when the session listing reports `headed: true`.

### A locator no longer matches

Capture a fresh accessibility snapshot and identify the control by its current
role and accessible name. Do not replace it with a DOM-position-dependent CSS or
XPath selector. If the user-visible behavior changed, record the observed result
as `FAIL` instead of weakening the expected result during the run.

### The live website or network is unavailable

Continue checks that remain independently reachable. Mark checks that cannot be
completed as `BLOCKED`, record the environmental evidence, calculate the overall
status according to the work instructions, and still attempt session cleanup.
