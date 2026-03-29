import { test, expect, type Page } from "@playwright/test";

/** Wait for GSAP entry animations to complete (opacity-0 classes are removed on finish). */
async function waitForAnimationsReady(page: Page) {
  await page.waitForFunction(() => {
    const cta = document.querySelector("button");
    return cta && !cta.closest(".opacity-0");
  });
}

test.describe("Lobby flow", () => {
  test("landing page loads with title and action buttons", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("imposteur");
    await expect(page.getByRole("button", { name: "Créer une partie" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Rejoindre par code" })).toBeVisible();
  });

  test("create lobby dialog opens and requires pseudo", async ({ page }) => {
    await page.goto("/");
    await waitForAnimationsReady(page);
    await page.getByRole("button", { name: "Créer une partie" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Button should be disabled without a pseudo
    const createBtn = dialog.getByRole("button", { name: "Créer le lobby" });
    await expect(createBtn).toBeDisabled();
  });

  test("join lobby dialog opens and validates code length", async ({ page }) => {
    await page.goto("/");
    await waitForAnimationsReady(page);
    await page.getByRole("button", { name: "Rejoindre par code" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Button should be disabled without valid code and pseudo
    const joinBtn = dialog.getByRole("button", { name: "Rejoindre", exact: true });
    await expect(joinBtn).toBeDisabled();
  });

  test("host can create lobby and see lobby page", async ({ page }) => {
    await page.goto("/");
    await waitForAnimationsReady(page);
    await page.getByRole("button", { name: "Créer une partie" }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByPlaceholder("Ton pseudo...").fill("TestHost");
    await dialog.getByRole("button", { name: "Créer le lobby" }).click();

    // Should navigate to lobby page
    await page.waitForURL(/\/lobby\/[A-Z0-9]{6}$/);
    await expect(page.getByText("Code du lobby")).toBeVisible();
    await expect(page.getByText("TestHost")).toBeVisible();
    await expect(page.getByText("Hôte")).toBeVisible();
  });

  test("host can see settings and player list", async ({ page }) => {
    await page.goto("/");
    await waitForAnimationsReady(page);
    await page.getByRole("button", { name: "Créer une partie" }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByPlaceholder("Ton pseudo...").fill("HostPlayer");
    await dialog.getByRole("button", { name: "Créer le lobby" }).click();
    await page.waitForURL(/\/lobby\/[A-Z0-9]{6}$/);

    await expect(page.getByText("Configuration")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Joueurs" })).toBeVisible();
    await expect(page.getByText("Quitter")).toBeVisible();
  });

  test("copy code button works", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    await waitForAnimationsReady(page);
    await page.getByRole("button", { name: "Créer une partie" }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByPlaceholder("Ton pseudo...").fill("CopyTest");
    await dialog.getByRole("button", { name: "Créer le lobby" }).click();
    await page.waitForURL(/\/lobby\/[A-Z0-9]{6}$/);

    await page.getByRole("button", { name: "Copier le code" }).click();
    await expect(page.getByText("Code copié !")).toBeVisible();
  });
});
