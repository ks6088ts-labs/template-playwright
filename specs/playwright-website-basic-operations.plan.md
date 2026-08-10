# Playwright.dev Basic Operations Test Plan

## Application Overview

Test plan for basic operations of the official Playwright website (https://playwright.dev/). The site is a Docusaurus-based documentation and marketing site. Core surfaces covered: the marketing homepage (hero, product cards, feature sections, footer), the top navigation bar (Docs, MCP, CLI, API links, language/binding switcher, GitHub/Discord links, theme toggle, search), the Algolia-powered search dialog, the color-mode (dark/light/system) toggle, and the documentation experience (collapsible sidebar, tabbed code blocks, copy-to-clipboard, in-page table-of-contents anchors). Every scenario assumes a fresh browser context with no saved state and can be run independently in any order.

## Test Scenarios

### 1. Homepage

**Seed:** `tests/seed.spec.ts`

#### 1.1. Homepage loads with hero content

**File:** `tests/homepage/hero-content.spec.ts`

**Steps:**
  1. Navigate to https://playwright.dev/
    - expect: The page title contains "Playwright"
    - expect: The main level-1 heading about reliable web automation for testing, scripting, and AI agents is visible
  2. Observe the hero banner call-to-action area
    - expect: A "Get started" link is visible
    - expect: A GitHub "Star" link and a stargazers count link (e.g. "93k+") are visible
  3. Observe the language availability paragraph in the hero
    - expect: Links for TypeScript, Python, .NET, and Java are visible

#### 1.2. Product cards are displayed

**File:** `tests/homepage/product-cards.spec.ts`

**Steps:**
  1. Navigate to https://playwright.dev/ and scroll to the product cards section
    - expect: Three cards titled "Playwright Test", "Playwright CLI", and "Playwright MCP" are visible
    - expect: Each card shows an install command code snippet and a documentation link
  2. Click the "Testing documentation" link on the Playwright Test card
    - expect: The browser navigates to the docs installation page at /docs/intro

#### 1.3. Get started CTA navigates to docs

**File:** `tests/homepage/get-started-cta.spec.ts`

**Steps:**
  1. Navigate to https://playwright.dev/
    - expect: The "Get started" link is visible in the hero
  2. Click the "Get started" link
    - expect: The URL changes to /docs/intro
    - expect: The page title contains "Installation"
    - expect: The documentation sidebar is visible

#### 1.4. Feature and adopter sections render

**File:** `tests/homepage/feature-sections.spec.ts`

**Steps:**
  1. Navigate to https://playwright.dev/ and scroll through the page
    - expect: Section headings "Built for testing", "Built for AI agents", and "Powerful tooling" are visible
  2. Continue scrolling to the adopters section
    - expect: The heading "Chosen by companies and open source projects" is visible
    - expect: A list of company logos (e.g. VS Code, Bing, Outlook) is displayed

### 2. Navigation

**Seed:** `tests/seed.spec.ts`

#### 2.1. Primary navigation links route correctly

**File:** `tests/navigation/primary-links.spec.ts`

**Steps:**
  1. Navigate to https://playwright.dev/ and click the "Docs" link in the top navigation
    - expect: The URL is /docs/intro
    - expect: The page title contains "Installation"
  2. Click the "API" link in the top navigation
    - expect: The URL contains /docs/api/class-playwright
    - expect: The API reference content is visible
  3. Click the "MCP" link in the top navigation
    - expect: The URL contains /mcp/introduction
  4. Click the "CLI" link in the top navigation
    - expect: The URL contains /agent-cli/introduction

#### 2.2. Logo returns to homepage

**File:** `tests/navigation/logo-home.spec.ts`

**Steps:**
  1. Navigate to https://playwright.dev/docs/intro
    - expect: The documentation page is displayed
  2. Click the "Playwright" logo in the top-left of the navigation
    - expect: The browser navigates back to the homepage at https://playwright.dev/
    - expect: The hero heading is visible

#### 2.3. Language switcher lists all bindings

**File:** `tests/navigation/language-switcher.spec.ts`

**Steps:**
  1. Navigate to https://playwright.dev/ and click the "Node.js" language dropdown button in the navigation
    - expect: A dropdown menu opens listing Node.js, Python, Java, and .NET
  2. Click the "Python" option in the dropdown
    - expect: The browser navigates to the Python docs area at /python/

#### 2.4. External repository links are present

**File:** `tests/navigation/external-links.spec.ts`

**Steps:**
  1. Navigate to https://playwright.dev/ and inspect the right side of the top navigation
    - expect: A "GitHub repository" link pointing to github.com/microsoft/playwright is present
    - expect: A "Discord server" link is present

### 3. Search

**Seed:** `tests/seed.spec.ts`

#### 3.1. Search returns live results for a valid query

**File:** `tests/search/valid-query.spec.ts`

**Steps:**
  1. Navigate to https://playwright.dev/ and click the "Search" button in the navigation
    - expect: A search dialog opens with an active search input
    - expect: The "Powered by Algolia" attribution is visible
  2. Type "locators" into the search input
    - expect: Grouped result sections such as "Guides" and "Classes" appear
    - expect: A result linking to /docs/locators is shown with the matching text highlighted
  3. Click the top "Locators" result
    - expect: The browser navigates to /docs/locators
    - expect: The Locators documentation page is displayed

#### 3.2. Search opens via keyboard shortcut

**File:** `tests/search/keyboard-shortcut.spec.ts`

**Steps:**
  1. Navigate to https://playwright.dev/ and press the search keyboard shortcut (Meta+K on macOS / Control+K on Windows)
    - expect: The search dialog opens with the input focused
  2. Press the Escape key
    - expect: The search dialog closes and focus returns to the page

#### 3.3. Clear button resets the search query

**File:** `tests/search/clear-query.spec.ts`

**Steps:**
  1. Navigate to https://playwright.dev/, open search, and type "assertions"
    - expect: Results for the query are displayed
    - expect: A "Clear the query" button becomes visible
  2. Click the "Clear the query" button
    - expect: The search input is emptied
    - expect: The previous result list is cleared

#### 3.4. Search with no matching results

**File:** `tests/search/no-results.spec.ts`

**Steps:**
  1. Navigate to https://playwright.dev/, open search, and type a nonsense query such as "zzzxxxqqq123"
    - expect: No result links are shown
    - expect: A no-results indicator such as "No results for" the query is displayed

### 4. Theme

**Seed:** `tests/seed.spec.ts`

#### 4.1. Toggle switches color mode

**File:** `tests/theme/toggle-color-mode.spec.ts`

**Steps:**
  1. Navigate to https://playwright.dev/ and click the dark/light mode toggle button in the navigation
    - expect: The document color mode changes (the root data-theme attribute becomes "light" or "dark")
    - expect: The toggle button label updates to reflect the new mode
  2. Reload the page
    - expect: The previously selected color mode is retained after reload

### 5. Documentation

**Seed:** `tests/seed.spec.ts`

#### 5.1. Sidebar navigation opens a doc page

**File:** `tests/docs/sidebar-navigation.spec.ts`

**Steps:**
  1. Navigate to https://playwright.dev/docs/intro
    - expect: The docs sidebar is visible with a "Getting Started" section
    - expect: Links such as "Writing tests" and "Running and debugging tests" are visible
  2. Click the "Writing tests" link in the sidebar
    - expect: The URL changes to /docs/writing-tests
    - expect: The main content updates to the Writing tests page

#### 5.2. Sidebar sections collapse and expand

**File:** `tests/docs/sidebar-collapse.spec.ts`

**Steps:**
  1. Navigate to https://playwright.dev/docs/intro and locate the expanded "Playwright Test" section in the sidebar
    - expect: The "Playwright Test" section header is shown as expanded with its child links visible
  2. Click the "Playwright Test" section header to collapse it
    - expect: The child links of the "Playwright Test" section are hidden
  3. Click the "Playwright Test" section header again to expand it
    - expect: The child links become visible again

#### 5.3. Code block language tabs switch

**File:** `tests/docs/code-tabs.spec.ts`

**Steps:**
  1. Navigate to https://playwright.dev/docs/intro and find the install command code block with npm/yarn/pnpm tabs
    - expect: The "npm" tab is selected by default
    - expect: The code shows the npm command
  2. Click the "pnpm" tab
    - expect: The "pnpm" tab becomes selected
    - expect: The displayed command updates to the pnpm variant

#### 5.4. Copy code button copies the snippet

**File:** `tests/docs/copy-code.spec.ts`

**Steps:**
  1. Navigate to https://playwright.dev/docs/intro and hover over the install command code block
    - expect: A "Copy code to clipboard" button is visible on the code block
  2. Click the "Copy code to clipboard" button
    - expect: The button indicates a successful copy (e.g. switches to a copied/checkmark state)

#### 5.5. Table-of-contents anchors scroll in-page

**File:** `tests/docs/toc-anchors.spec.ts`

**Steps:**
  1. Navigate to https://playwright.dev/docs/intro and locate the on-this-page table of contents
    - expect: Entries such as "Installing Playwright", "What's installed", and "How to run the example test" are visible
  2. Click the "How to run the example test" table-of-contents entry
    - expect: The URL updates with the #running-the-example-test anchor
    - expect: The "Running the Example Test" heading is scrolled into view

### 6. Footer

**Seed:** `tests/seed.spec.ts`

#### 6.1. Footer navigation columns are present

**File:** `tests/footer/footer-columns.spec.ts`

**Steps:**
  1. Navigate to https://playwright.dev/ and scroll to the footer
    - expect: Footer columns "Learn", "Community", and "More" are visible
    - expect: The "Copyright © Microsoft" notice is displayed
  2. Click the "Getting started" link in the footer "Learn" column
    - expect: The browser navigates to /docs/intro
