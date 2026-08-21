# Create a Screenshot Guide with Playwright CLI

## Purpose

This scenario demonstrates how a coding agent can turn a plain-language request
into a **beginner-friendly, screenshot-illustrated GUI manual** using Playwright
CLI. The agent drives a real browser, captures one screenshot per step, and
writes a Markdown guide that a non-technical reader can follow.

The target is the public [Swagger UI Petstore](https://petstore.swagger.io/)
demo. The produced guide walks through a single API operation,
`GET /pet/findByStatus`, from opening the page to reading the server response.

Unlike the other scenarios in this repository, this one intentionally **commits
its screenshots** as part of the deliverable — the images are the documentation.

## Scenario files

| File | Role |
| --- | --- |
| [Work instructions](templates/guide-instructions.md) | Natural-language procedure supplied to the agent as context. |
| [Sample guide](sample-guide/petstore-swagger-ui-guide.md) | Beginner manual produced from a real run of this scenario. |
| `sample-guide/images/` | Curated screenshots referenced by the sample guide. |

## A note on committed screenshots

The repository normally keeps screenshots and other generated browser output out
of Git (see [AGENTS.md](../../../AGENTS.md)). This scenario is a deliberate
exception: the reviewed images under `sample-guide/images/` are published
documentation, not transient capture output. Temporary snapshots that Playwright
CLI writes under `.playwright-cli/` remain ignored and are never committed.

## Prerequisites

- Node.js 20 or newer and pnpm.
- Network access to `https://petstore.swagger.io/`.
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

## Step 2: Review the instructions

Read the [work instructions](templates/guide-instructions.md) before running the
scenario. They define the target site, the named browser session, the six
walkthrough steps, the screenshot naming and save location, and the required
shape of the finished guide.

## Step 3: Ask the agent to produce the guide

Give the instructions file to the agent as context. The following request is
ready to use from the repository root:

> Use the Playwright CLI Agent Skill to follow the procedure in
> docs/scenarios/create-screenshot-guide/templates/guide-instructions.md.
>
> Capture one screenshot per step into
> docs/scenarios/create-screenshot-guide/sample-guide/images/ and write the
> beginner guide to
> docs/scenarios/create-screenshot-guide/sample-guide/petstore-swagger-ui-guide.md.
> Use the named session create-screenshot-guide, base every caption on observed
> evidence, treat the response body as dynamic, then create the Japanese sibling
> with the translate-markdown-ja skill and close the browser session when finished.

The agent should follow an observe-decide-act loop: inspect the current
accessibility snapshot, choose a user-facing locator, perform one action, capture
the step, and move on. It should reposition the relevant element to the top of
the viewport before each screenshot.

## Step 4: Review the produced guide

Confirm that the finished guide:

1. Opens with a short, plain-language introduction and a note that the
   screenshots are a point-in-time snapshot of a shared demo.
2. Contains one numbered step for each action, each with a "what to do", a
   screenshot, and a "what you should see".
3. References only images that exist under `sample-guide/images/`, and every
   image renders.
4. Reflects observed evidence — the real request URL and a `200` response — and
   does not present the dynamic pet list as fixed.
5. Has a Japanese sibling (`petstore-swagger-ui-guide.ja.md`) that matches the
   English source.

The checked-in [sample guide](sample-guide/petstore-swagger-ui-guide.md) shows
the expected level of detail. It is evidence from one point in time, not a
permanent claim about the live website.

## Success criteria

- The agent derives browser actions from the natural-language instructions and
  captures a clean screenshot for every step.
- The guide is understandable by a non-technical reader and is backed by observed
  evidence.
- Screenshots are saved under `sample-guide/images/` with step-numbered names and
  are referenced by relative path.
- The English guide and its Japanese sibling are consistent.
- The named browser session is closed after execution, and no raw snapshots,
  traces, browser profiles, or credentials are added to the scenario directory.

## Troubleshooting

### The CLI or browser is unavailable

Run `pnpm install --frozen-lockfile`, then `pnpm run pw:install-browser`. Confirm
that `pnpm exec playwright-cli --version` succeeds before starting.

### The named session is already open

Close only the session used by this scenario, then start again:

```sh
pnpm exec playwright-cli -s=create-screenshot-guide close
```

### A cookie banner covers the page

Dismiss it before capturing, for example by activating **Allow all cookies**, so
it does not appear in the screenshots.

### A locator no longer matches

Capture a fresh accessibility snapshot and identify the control by its current
role and accessible name. The `status` filter is a multi-select list
(`getByRole('listbox')`); the page also has a separate "Response content type"
select, so scope the locator to the intended control.

### The live website or network is unavailable

Stop and report the environmental blocker. Do not fabricate screenshots or
responses. Still attempt to close the named browser session.
