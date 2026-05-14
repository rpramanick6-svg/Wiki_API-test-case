import { test, expect } from '@playwright/test';

test('Wikipedia search with API validation', async ({ page, request }) => {
  // Step 1: Open the Wikipedia home page.
  await page.goto('https://en.wikipedia.org/wiki/Main_Page');

  // Step 2: Verify that the page title contains "Wikipedia".
  // This ensures the main page loaded correctly.
  await expect(page).toHaveTitle(/Wikipedia/i);

  // Step 3: Locate the search box and enter the search term.
  // Here we search for the article "Playwright".
  await page.getByRole('searchbox').fill('Playwright');

  // Step 4: Click the search button to submit the search.
  await page.getByRole('button', { name: /search/i }).click();

  // Step 5: Verify that the user is redirected to a relevant page.
  // Depending on Wikipedia behavior, this could land directly on the article
  // or on a search results page.
  await expect(page).toHaveURL(/Playwright|Special:Search/);

  // Step 6: Find the main page heading of the article or result page.
  const heading = page.locator('#firstHeading');

  // Step 7: Ensure the heading is visible.
  // This confirms the content area has loaded successfully.
  await expect(heading).toBeVisible();

  // Step 8: Read the heading text from the page.
  const headingText = await heading.textContent();

  // Step 9: Assert that the heading contains the word "playwright".
  // We use lowercase comparison to avoid case-sensitivity issues.
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
  // This ensures meaningful content is returned by the API.
  expect(body.extract).toBeTruthy();

  // Step 16: Locate the main content area of the page.
  const content = page.locator('#mw-content-text');

  // Step 17: Verify that the content section is visible.
  // This confirms the article body is rendered in the UI.
  await expect(content).toBeVisible();

  // Step 18: Check that at least one link is visible on the page.
  // This is a small extra assertion to validate the page is interactive and not partially broken.
  await expect(page.locator('a').first()).toBeVisible();
});