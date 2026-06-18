import { expect, test } from "@playwright/test";

test.describe("settings dashboard", () => {
  test("renders and switches between all settings sections", async ({ page }) => {
    await page.goto("/dashboard/settings");

    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    await expect(
      page.getByText(
        "Configure system preferences, manage your organization profile, and control notifications."
      )
    ).toBeVisible();

    const tabs = [
      "Organization",
      "Preferences",
      "Notifications",
      "Account",
      "Data Management",
      "About",
    ];

    for (const tab of tabs) {
      await expect(page.getByRole("tab", { name: tab })).toBeVisible();
    }

    await expect(
      page.getByRole("heading", { name: "Organization Profile" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Upload Logo" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save Changes" })).toBeVisible();

    await page.getByRole("tab", { name: "Preferences" }).click();
    await expect(
      page.getByRole("heading", { name: "System Preferences" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Regional Settings" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Save Preferences" })).toBeVisible();

    await page.getByRole("tab", { name: "Notifications" }).click();
    await expect(
      page.getByRole("heading", { name: "Notification Settings" })
    ).toBeVisible();
    await expect(page.getByRole("switch")).toHaveCount(6);
    await expect(page.getByText("Email Digest")).toBeVisible();
    await expect(page.getByRole("button", { name: "Save Notifications" })).toBeVisible();

    await page.getByRole("tab", { name: "Account" }).click();
    await expect(
      page.getByRole("heading", { name: "Account Settings" })
    ).toBeVisible();
    await expect(page.getByText("System Administrator")).toBeVisible();
    await expect(page.getByRole("button", { name: "Change Password" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save Account" })).toBeVisible();

    await page.getByRole("tab", { name: "Data Management" }).click();
    await expect(
      page.getByRole("heading", { name: "Data Management" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Storage Overview" })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Danger Zone" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Purge Data" })).toBeVisible();

    await page.getByRole("tab", { name: "About" }).click();
    await expect(page.getByRole("heading", { name: "About" })).toBeVisible();
    await expect(
      page.getByText("KAG Retirement Management System")
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "System Statistics" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Technology Stack" })
    ).toBeVisible();
    await expect(page.getByLabel("React 19.x")).toBeVisible();
  });
});
