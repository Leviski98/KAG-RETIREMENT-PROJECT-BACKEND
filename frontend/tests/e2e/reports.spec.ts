import { expect, test } from "@playwright/test";

test.describe("reports dashboard", () => {
  test("renders supported reports and generated previews", async ({ page }) => {
    await page.goto("/dashboard/reports");

    await expect(
      page.getByRole("heading", { name: "Reports & Analytics" })
    ).toBeVisible();
    await expect(
      page.getByText("Generate live district summaries and pastor demographic reports.")
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Filter reports by time range" })
    ).toContainText("All Time");

    await expect(
      page.getByRole("heading", { name: "District Summary Report" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Pastor Demographics Report" })
    ).toBeVisible();
    await expect(page.getByText("Retirement Contributions Report")).toHaveCount(0);
    await expect(page.getByText("Church Growth Report")).toHaveCount(0);

    await expect(page.getByRole("button", { name: /^Generate / })).toHaveCount(2);
    await expect(page.getByRole("heading", { name: "Recent Reports" })).toBeVisible();
    await expect(page.getByText("2 reports")).toBeVisible();
    await expect(page.getByText("District Summary Live Report")).toBeVisible();
    await expect(page.getByText("Pastor Demographics Live Report")).toBeVisible();
    await expect(page.getByText("Ready")).toHaveCount(2);

    await page
      .getByRole("button", { name: "Generate District Summary Report" })
      .click();
    await expect(
      page.getByText("KAG Retirement Management System")
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "District Summary Report" })
    ).toHaveCount(2);
    await expect(page.getByRole("columnheader", { name: "District" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Sections" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Churches" })).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Assigned Pastors" })
    ).toBeVisible();

    await page
      .getByRole("button", { name: "Generate Pastor Demographics Report" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Pastor Demographics Report" })
    ).toHaveCount(2);
    await expect(page.getByText("Gender")).toBeVisible();
    await expect(page.getByText("Rank")).toBeVisible();
    await expect(page.getByText("Status")).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Years Served" })).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Proj. Retirement" })
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Remaining Tenure" })
    ).toBeVisible();
  });
});
