import { execFileSync } from "node:child_process";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { apiUrl } from "../../playwright.config";

// The password-reset pages are public, so run these unauthenticated. The shared
// admin storageState would only add an irrelevant session (and the whole point
// of the success case is to reset a *different*, throwaway user).
test.use({ storageState: { cookies: [], origins: [] } });

const pythonCommand = process.platform === "win32" ? "python" : "python3";
const backendDir = path.resolve(__dirname, "../../../backend");

/**
 * Mint a real reset token via the management command (the API deliberately
 * never returns one). --create seeds a dedicated verified/active user so this
 * never touches the shared e2e admin's session.
 */
function issueResetLink(): { email: string; token: string; link: string } {
  const output = execFileSync(
    pythonCommand,
    ["manage.py", "issue_password_reset_link", "--create", "--json"],
    { cwd: backendDir, encoding: "utf-8" }
  );
  const jsonLine = output.trim().split("\n").findLast((line) => line.startsWith("{"));
  if (!jsonLine) {
    throw new Error(`issue_password_reset_link produced no JSON output:\n${output}`);
  }
  return JSON.parse(jsonLine);
}

test.describe("password reset", () => {
  test("login page links to the forgot-password page", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Forgot password?" }).click();
    await expect(page).toHaveURL(/\/forgot-password$/);
    await expect(page.getByText("Forgot your password?")).toBeVisible();
  });

  test("requesting a reset shows the check-your-email screen", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByPlaceholder("you@church.org").fill("anyone@kag.test");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByText("Check your email")).toBeVisible();
  });

  test("reset page without a token shows an invalid-link message", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.getByText("Invalid reset link")).toBeVisible();
  });

  test("an invalid token surfaces an error on submit", async ({ page }) => {
    await page.goto("/reset-password?token=not-a-real-token");
    await page.getByPlaceholder("At least 8 characters").fill("BrandNew#Pass2026");
    await page.getByRole("button", { name: "Reset password" }).click();
    await expect(page.getByText(/invalid or has expired/i)).toBeVisible();
  });

  test("a valid token resets the password end-to-end", async ({ page, request }) => {
    const { email, token } = issueResetLink();
    const newPassword = `Reset#${Date.now()}aB`;

    await page.goto(`/reset-password?token=${token}`);
    await page.getByPlaceholder("At least 8 characters").fill(newPassword);
    await page.getByRole("button", { name: "Reset password" }).click();
    await expect(page.getByText("Password reset", { exact: true })).toBeVisible();

    // The new password must actually authenticate: a valid login returns 200 and
    // moves the user to the OTP step.
    const login = await request.post(`${apiUrl}/auth/login`, {
      data: { email, password: newPassword },
    });
    expect(login.status()).toBe(200);
  });
});
