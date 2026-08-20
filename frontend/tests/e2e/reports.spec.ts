import { expect, test } from "@playwright/test";

test.describe("reports dashboard", () => {
  test("renders supported reports and generated previews", async ({ page }) => {
    await page.goto("/dashboard/reports");

    await expect(
      page.getByRole("heading", { name: "Reports & Analytics" })
    ).toBeVisible();
    await expect(
      page.getByText("Preview and download live district summaries and pastor demographic reports.")
    ).toBeVisible();
    // Time-range filter defaults to "All Time"; picking "This Year"/"Last
    // Year" re-queries both report endpoints with a `range` param that
    // filters by pastor-assignment date server-side.
    await expect(page.getByRole("button", { name: "All Time" })).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "District Summary Report" })
    ).toHaveCount(1);
    await expect(
      page.getByRole("heading", { name: "Pastor Demographics Report" })
    ).toHaveCount(1);
    // Two placeholder reports that were planned but never built.
    await expect(page.getByText("Retirement Contributions Report")).toHaveCount(0);
    await expect(page.getByText("Church Growth Report")).toHaveCount(0);

    // Each report card exposes both a Preview and a Download PDF action.
    await expect(page.getByRole("button", { name: /^Preview / })).toHaveCount(2);
    await expect(page.getByRole("button", { name: /^Download .* as PDF$/ })).toHaveCount(2);

    await page
      .getByRole("button", { name: "Preview District Summary Report" })
      .click();
    // The preview toggles an inline live view of the report on the same page.
    // The letterhead's org name now comes from SystemSettings.org_name
    // (rendered uppercase via CSS, not in the DOM text) rather than the old
    // hardcoded "KAG Retirement Management System" string. A fresh CI
    // database has no settings row yet — SystemSettingsView.get_or_create's
    // it on first fetch, seeding the model's default org_name.
    await expect(
      page.getByText("Kenya Assemblies of God")
    ).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "District" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Sections" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Churches" })).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Assigned Pastors" })
    ).toBeVisible();

    await page
      .getByRole("button", { name: "Preview Pastor Demographics Report" })
      .click();
    // After opening the preview the report title appears twice — once as the
    // card heading and once inside the rendered report body.
    await expect(
      page.getByRole("heading", { name: "Pastor Demographics Report" })
    ).toHaveCount(2);
    // The demographics preview always renders the Gender / Rank / Status
    // breakdown sections, even against an empty database (they show "No data
    // available" placeholders). The per-pastor Years Served / Proj. Retirement
    // / Remaining Tenure columns only appear once seeded fixture data exists —
    // reinstate those assertions once the e2e suite seeds pastors.
    await expect(page.getByRole("heading", { name: "Gender" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Rank" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Status" })).toBeVisible();
  });
});
