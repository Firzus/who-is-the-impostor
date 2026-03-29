import { test, expect } from "@playwright/test";

test.describe("Lobby flow", () => {
  test("landing page loads with title and action buttons", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("imposteur");
    await expect(page.getByText("Créer une partie")).toBeVisible();
    await expect(page.getByText("Rejoindre par code")).toBeVisible();
  });

  test("create lobby dialog opens and requires pseudo", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Créer une partie").click();
    await expect(page.getByText("Créer le lobby")).toBeVisible();

    // Button should be disabled without a pseudo
    const createBtn = page.getByRole("button", { name: "Créer le lobby" });
    await expect(createBtn).toBeDisabled();
  });

  test("join lobby dialog opens and validates code length", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Rejoindre par code").click();
    await expect(page.getByText("Rejoindre")).toBeVisible();

    // Button should be disabled without valid code and pseudo
    const joinBtn = page.getByRole("button", { name: "Rejoindre" });
    await expect(joinBtn).toBeDisabled();
  });

  test("host can create lobby and see lobby page", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Créer une partie").click();

    const nameInput = page.getByPlaceholder("Ton pseudo...");
    await nameInput.fill("TestHost");
    await page.getByRole("button", { name: "Créer le lobby" }).click();

    // Should navigate to lobby page
    await page.waitForURL(/\/lobby\/[A-Z0-9]{6}$/);
    await expect(page.getByText("Code du lobby")).toBeVisible();
    await expect(page.getByText("TestHost")).toBeVisible();
    await expect(page.getByText("Hôte")).toBeVisible();
  });

  test("host can see settings and player list", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Créer une partie").click();
    await page.getByPlaceholder("Ton pseudo...").fill("HostPlayer");
    await page.getByRole("button", { name: "Créer le lobby" }).click();
    await page.waitForURL(/\/lobby\/[A-Z0-9]{6}$/);

    await expect(page.getByText("Configuration")).toBeVisible();
    await expect(page.getByText("Joueurs")).toBeVisible();
    await expect(page.getByText("Quitter")).toBeVisible();
  });

  test("copy code button works", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    await page.getByText("Créer une partie").click();
    await page.getByPlaceholder("Ton pseudo...").fill("CopyTest");
    await page.getByRole("button", { name: "Créer le lobby" }).click();
    await page.waitForURL(/\/lobby\/[A-Z0-9]{6}$/);

    await page.getByRole("button", { name: "Copier le code" }).click();
    await expect(page.getByText("Code copié !")).toBeVisible();
  });
});
