# Wiki_API-test-case
# Playwright Wikipedia Search + API Validation Test

This project contains a realistic sample Playwright test case that I built. It combines UI validation with API assertions in a single automated flow. Playwright supports direct API testing through `APIRequestContext`, and the same framework can be used to validate browser behavior, page state, and network responses together.

## Overview

The test uses Wikipedia as a public, read-only application under test. This makes it useful for demonstrating search validation, page assertions, response verification, and API-to-UI consistency checks without needing authentication, test data seeding, or destructive actions such as create, update, or delete operations.

### Test objective

The goal of this test case is to validate that a user can search for a topic on Wikipedia, land on a relevant page, and confirm that the page content aligns with data returned by the Wikipedia REST API. This pattern is practical for learning Playwright because it demonstrates both browser automation and API testing in one test case.

## Test flow

The automated test covers the following sequence:

1. Open the Wikipedia main page.
2. Verify that the page title contains `Wikipedia`.
3. Enter `Playwright` in the search box and submit the search.
4. Confirm that the browser lands on a relevant result or article page.
5. Verify that the main page heading is visible and contains the searched topic.
6. Send a GET request to Wikipedia's REST API endpoint for the same topic using Playwright's request fixture.
7. Assert that the API response status is `200` and the content type is JSON.
8. Parse the response body and validate fields such as `title` and `extract`.
9. Confirm that the main content section is visible in the UI.
10. Perform one or two small extra assertions, such as checking that a link is visible on the page.

## Why this test is useful

This test is a good beginner-to-intermediate portfolio example because it shows more than simple UI clicking. It demonstrates that the same Playwright test can verify frontend rendering and backend data consistency using request-based API checks.

It also follows recommended test-design ideas such as keeping tests readable, validating meaningful outcomes rather than only checking clicks, and organizing test logic into clear steps. Playwright best-practice guidance emphasizes writing focused, maintainable tests and structuring them clearly for debugging and long-term maintenance.

## Recommended project structure

A simple project structure for this test can look like this:

```text
playwright-wikipedia-test/
├── tests/
│   └── wikipedia.spec.ts
├── playwright.config.ts
├── package.json
└── README.md
```

## My Test Case Code
``` import { test, expect } from '@playwright/test';

test('Wikipedia search with API validation', async ({ page, request }) => {
  // Step 1: Open the Wikipedia home page.
  // Step 2: Verify that the page title contains "Wikipedia".
  // Step 3: Locate the search box and enter the search term.
  // Step 4: Click the search button to submit the search.
  // Step 5: Verify that the user is redirected to a relevant page.


  await page.goto('https://en.wikipedia.org/wiki/Main_Page');
  await expect(page).toHaveTitle(/Wikipedia/i);
  await page.getByRole('searchbox').fill('Playwright');
  await page.getByRole('button', { name: /search/i }).click();
  await expect(page).toHaveURL(/Playwright|Special:Search/);

  // Step 6: Find the main page heading of the article or result page.
  const heading = page.locator('#firstHeading');

  // Step 7: Ensure the heading is visible.
  // Confirming the content area has loaded successfully.
  await expect(heading).toBeVisible();

  // Step 8: Read the heading text from the page.
  const headingText = await heading.textContent();

  // Step 9: Assert that the heading contains the word "playwright".
  // I used lowercase comparison to avoid case-sensitivity issues.
  expect(headingText?.toLowerCase()).toContain('playwright');

  // Step 10: Send a GET request to Wikipedia's REST API to retrieve the summary for the same article.
  const apiResponse = await request.get(
    'https://en.wikipedia.org/api/rest_v1/page/summary/Playwright'
  );

  // Step 11: Verify that the API returned HTTP 200.
  // This confirms the API request was successful.
  expect(apiResponse.status()).toBe(200);

  // Step 12: Optionally validate that the response is JSON.
  // This is useful before parsing the body.
  expect(apiResponse.headers()['content-type']).toContain('application/json');

  // Step 13: Parse the API response body into JSON.
  const body = await apiResponse.json();

  // Step 14: Assert that the API response has the expected title.
  expect(body.title.toLowerCase()).toContain('playwright');

  // Step 15: Assert that the summary/extract is not empty.
  // Ensuring meaningful content is returned by the API.
  expect(body.extract).toBeTruthy();

  // Step 16: Locate the main content area of the page.
  const content = page.locator('#mw-content-text');

  // Step 17: Verify that the content section is visible.
  // Confirmingthe article body is rendered in the UI.
  await expect(content).toBeVisible();

  // Step 18: Check that at least one link is visible on the page.
  await expect(page.locator('a').first()).toBeVisible();
});
```

## My Cofig File code
``` // @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  timeout: 30 * 1000,

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    headless: false,
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Timeout for expect assertions and waiting helpers. */
    expect: {
      timeout: 5 * 1000,
    },

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

 
  ],

});

 ```

In Playwright configuration, top-level options such as `testDir`, `timeout`, `expect`, and `reporter` control the test runner, while `use` defines shared runtime settings such as browser choice, headless mode, viewport, tracing, and other browser or context options.

## `use` vs `projects`

Use `use` when the same browser and runtime settings should apply to all tests by default. Use `projects` when the same test suite needs to run under multiple configurations, such as Chromium, Firefox, WebKit, or mobile device presets.

A simple rule of thumb:

- `use` = one default environment for all tests.
- `projects` = many named environments for the same tests.

Example multi-project setup:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
```

Playwright documents `projects` as the way to run the same tests across different browsers and devices using named configurations.

## Assertions used in this test

This test includes several small but useful assertion types:

- Page title validation with `toHaveTitle`.
- URL validation with `toHaveURL`.
- Element visibility validation with `toBeVisible`.
- String matching with `toContain`.
- Status code validation with `response.status()`.
- Header validation through `response.headers()`.
- JSON body validation using `response.json()`.

These assertions help verify both user-facing behavior and backend response integrity in a compact, realistic test case.

## Good improvements

The test can be improved further by:

- Replacing inline comments with `test.step()` for cleaner reporting and better debugging visibility in the Playwright report.
- Moving Wikipedia locators into a Page Object Model if the suite grows larger.
- Adding negative tests for invalid searches or fallback search-result behavior.
- Running the same test in multiple browsers using `projects`.

Guidance around test readability and maintainability consistently recommends clear structure, meaningful assertions, and scalable organization as the suite expands.

## Limitations

Wikipedia is a strong choice for read-only validation, but it is not ideal for demonstrating full CRUD-style API automation. Since it is a public content platform, it is better suited for search, response, rendering, and content consistency checks than for business-style workflows such as login, create, update, and delete scenarios.

