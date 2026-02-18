import { test, expect } from "@playwright/test";

test.describe("Game Selection and Solving", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/solve");
  });

  test("should allow switching games and solving", async ({ page }) => {
    // Wait for dictionary to load
    await expect(page.getByTestId("trie-loaded")).toBeAttached({
      timeout: 15000,
    });

    // Check initial state
    await expect(page.getByTestId("header-logo")).toBeVisible();
    await expect(page.getByTestId("game-toggle-CrossPlay")).toBeVisible();

    // Switch to Scrabble
    await page.getByTestId("game-toggle-Scrabble").click();

    // Enter tiles in the rack
    const rackInput = page.getByTestId("rack-input");
    await rackInput.fill("HELLO");

    // Verify some results appear (Playwright's expect will wait for them)
    await expect(page.getByTestId("best-move-item").first()).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByTestId("move-word").first()).toContainText("HELLO");
  });

  test("should persist game selection across reloads", async ({ page }) => {
    // Wait for dictionary to load
    await expect(page.getByTestId("trie-loaded")).toBeAttached({
      timeout: 15000,
    });

    await page.getByTestId("game-toggle-Scrabble").click();
    await page.reload();

    // Wait for dictionary again
    await expect(page.getByTestId("trie-loaded")).toBeAttached({
      timeout: 15000,
    });

    const rackInput = page.getByTestId("rack-input");
    await rackInput.fill("TEST");

    await expect(page.getByTestId("best-move-item").first()).toBeVisible({
      timeout: 10000,
    });
  });
});
