# Quick Demo: Your First Local Chrome Automation

## Purpose

This beginner scenario uses Playwright CLI to launch Google Chrome, display a
self-contained page, inspect it, operate one checkbox, and close the browser.
Run each command separately and check the result before continuing.

The page is included directly in the `open` command. It does not require a
website, account, network connection, helper script, or configuration file.
The scenario does not reuse an existing Chrome profile or its signed-in state.

## Before you start

- Install Google Chrome on this computer.
- Open a terminal in the repository root.
- Close any Playwright CLI session named `local-chrome` left by an earlier run.

## Step 1: Confirm the CLI is available

```sh
pnpm exec playwright-cli --version
```

The command should print a version number. If it reports an error, stop here
and make sure the project dependencies are installed before continuing.

## Step 2: Launch Chrome

```sh
pnpm exec playwright-cli -s=local-chrome open \
  'data:text/html,<title>Playwright CLI Demo</title><main><h1>Playwright CLI Demo</h1><label><input type="checkbox"> Automation works</label></main>' \
  --browser=chrome
```

This command does three things:

1. `-s=local-chrome` gives the browser session a name.
2. `open` starts a browser and opens the supplied page.
3. `--browser=chrome` selects the locally installed Google Chrome.

A Chrome window should open and display the heading **Playwright CLI Demo** and
an unchecked **Automation works** checkbox. Keep the terminal and Chrome open.

## Step 3: Inspect the page

```sh
pnpm exec playwright-cli -s=local-chrome snapshot
```

The snapshot is a text representation of the visible page. Confirm that its
output contains both `Playwright CLI Demo` and `Automation works`. Interactive
elements may also have temporary references such as `e2`; those references can
change whenever a new snapshot is taken.

## Step 4: Operate the checkbox

```sh
pnpm exec playwright-cli -s=local-chrome click \
  "getByRole('checkbox', { name: 'Automation works' })"
```

The locator identifies the checkbox by its role and visible label. Confirm in
Chrome that the checkbox is now selected.

## Step 5: Confirm the changed state

```sh
pnpm exec playwright-cli -s=local-chrome snapshot
```

Find `Automation works` again. Its snapshot entry should now include
`checked`, confirming that the command changed the page in Chrome.

## Step 6: Close Chrome

```sh
pnpm exec playwright-cli -s=local-chrome close
```

The Chrome window opened by this scenario should close. The CLI session is now
finished. The commands do not save a screenshot or a named scenario output.
Playwright CLI still writes temporary snapshots under `.playwright-cli/`, which
this project ignores in Git.

## Success criteria

- Google Chrome opens with the self-contained demo page.
- The first snapshot shows the heading and an unchecked checkbox.
- The `click` command selects the checkbox.
- The second snapshot reports the checkbox as checked.
- The `close` command closes Chrome and ends the named session.

## Troubleshooting

### The browser does not open

Confirm that desktop Google Chrome is installed and that Step 1 prints a CLI
version. Then run Step 2 again.

### `Browser local-chrome is already open`

An earlier run left the named session open. Close it and repeat Step 2:

```sh
pnpm exec playwright-cli -s=local-chrome close
```

### `The browser 'local-chrome' is not open`

The session has not been started or has already been closed. Run Step 2 before
continuing, and include `-s=local-chrome` in every later command.

### The checkbox cannot be found

Run Step 3 again and confirm that `Automation works` appears in the snapshot.
If it does not, close the session and restart from Step 2.
