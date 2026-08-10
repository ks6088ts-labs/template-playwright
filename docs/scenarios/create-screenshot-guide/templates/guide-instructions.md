# Work Instructions: Create a Screenshot Guide for Swagger UI Petstore

## Objective

Use Playwright CLI to produce a beginner-friendly, screenshot-illustrated GUI
manual that teaches a first-time user how to call one API operation in
[Swagger UI Petstore](https://petstore.swagger.io/). Walk through the
`GET /pet/findByStatus` operation end to end, capture one screenshot per step,
and write the result as a Markdown guide. This is a read-only visit to a public,
third-party demo site.

The checked-in sample produced from these instructions is
[sample-guide/petstore-swagger-ui-guide.md](../sample-guide/petstore-swagger-ui-guide.md)
with images under `sample-guide/images/`.

## Execution rules

- Run commands from the repository root.
- Use the project-local CLI through `pnpm exec playwright-cli` and follow the
  installed Playwright CLI Agent Skill.
- Use the named browser session `create-screenshot-guide` for every browser
  command, and close it during cleanup.
- Use a fresh, CLI-managed browser. Do not attach to a personal browser or use a
  persistent profile, saved state, cookies, or credentials.
- Set a consistent viewport with `resize 1280 900` before capturing, so every
  screenshot has the same width.
- Prefer accessibility snapshots and user-facing locators based on role and
  accessible name. Take a fresh snapshot after navigation or a material
  page-state change, and do not reuse temporary element references from an older
  snapshot.
- Keep the visit read-only: only expand an operation, use **Try it out**, select
  a value, and **Execute**. Do not create, update, delete, upload, or authorize.
- If a cookie or consent banner appears, dismiss it before capturing so it does
  not cover the page.
- Base every caption on what you actually observed. The Petstore is a shared
  public sandbox, so treat the response body as dynamic and tell the reader it
  will differ.

## Screenshot rules

- Save curated screenshots to `sample-guide/images/` using the CLI
  `screenshot --filename=<path>` option.
- Name files with a two-digit step prefix and a short description, for example
  `01-overview.png`, `02-expand-findbystatus.png`.
- Before each capture, scroll the relevant element to the top of the viewport so
  the step's controls are fully visible.
- Capture the viewport (not the full page) so images stay small and focused.
- Do not capture overlays, banners, personal data, or unrelated browser chrome.
- These images are intentional documentation deliverables. Keep them; do not
  treat them as the transient output under `.playwright-cli/`.

## Guide structure

Write the guide so that a non-technical reader can follow it. Include:

1. A short introduction: what Swagger UI is, the target site, and what the reader
   will accomplish.
2. A note that the screenshots are a point-in-time snapshot of a shared demo.
3. A "Before you start" list (a browser and an internet connection).
4. One numbered step per action below. For each step provide: what to do, the
   screenshot, and what the reader should see.
5. A short "What next?" section suggesting safe follow-up actions.

Keep exactly one screenshot per step, place it directly under the step heading,
and reference it with a relative path such as `images/01-overview.png`.

## Walkthrough steps

Capture one screenshot for each step.

1. **Open and orient** — Open `https://petstore.swagger.io/`, dismiss any cookie
   banner, and scroll to the top. Point out the title (`Swagger Petstore`), the
   base URL (`petstore.swagger.io/v2`), the **Authorize** button, and the
   **pet** / **store** / **user** tag groups.
2. **Expand the operation** — In the **pet** group, expand
   **GET** `/pet/findByStatus` ("Finds Pets by status"). Point out the
   description, the required `status` parameter with values `available`,
   `pending`, `sold`, and the example `200` response.
3. **Try it out** — Click **Try it out**. Point out that the `status` field is
   now editable, an **Execute** button appeared, and the button changed to
   **Cancel**.
4. **Set the parameter** — Select `available` in the `status` control. Confirm
   the value is selected.
5. **Execute** — Click **Execute**. Point out the generated **Curl** command and
   the **Request URL**, and note how `available` appears as `?status=available`.
6. **Read the response** — Show the **Server response**: the `200` code, the JSON
   **Response body** (a list of pets), and the **Response headers**.

## Output, translation, and cleanup

- Write the English guide to
  `sample-guide/petstore-swagger-ui-guide.md`.
- Create the Japanese sibling `sample-guide/petstore-swagger-ui-guide.ja.md` with
  the `translate-markdown-ja` skill, keeping the English file canonical.
- Close the `create-screenshot-guide` session after the final capture, including
  after a failed or blocked run. Temporary files under `.playwright-cli/` are
  local CLI artifacts, not part of the deliverable.
- If the site or network is unavailable, stop and report it as an environmental
  blocker instead of fabricating screenshots or responses.
