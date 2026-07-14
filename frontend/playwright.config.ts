import { defineConfig, devices } from "@playwright/test";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const pythonCommand = process.platform === "win32" ? "python" : "python3";

// The auth cookies are host-only (no `Domain=` set -- see accounts/views.py
// set_jwt_cookies), so the frontend and API hosts below must be the exact same
// hostname string or every authenticated spec silently loses its session ("localhost"
// and "127.0.0.1" are different cookie jars even on the same machine/port). Default to
// "localhost" to match lib/api/client.ts's own hardcoded fallback and avoid drift.
export const frontendUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
export const apiUrl = process.env.PLAYWRIGHT_API_URL ?? "http://localhost:8000/api";
const manageServers = process.env.PLAYWRIGHT_MANAGE_SERVERS === "true";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["html"], ["list"]],
  globalSetup: "./tests/e2e/global-setup.ts",
  use: {
    baseURL: frontendUrl,
    storageState: "./tests/e2e/.auth/admin.json",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
    extraHTTPHeaders: {
      Accept: "application/json",
    },
  },
  metadata: {
    apiUrl,
  },
  webServer: manageServers ? [
    {
      command: `${pythonCommand} manage.py runserver 127.0.0.1:8000 --noreload`,
      cwd: "../backend",
      url: apiUrl.replace(/\/api\/?$/, "/api/schema/"),
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: "ignore",
      stderr: "ignore",
    },
    {
      command: `${npmCommand} run dev -- --hostname 127.0.0.1 --port 3000`,
      url: frontendUrl,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: "ignore",
      stderr: "ignore",
      // NEXT_PUBLIC_API_URL is inlined into the client bundle, so it must be forced
      // to match `apiUrl` here rather than left to next dev's own default -- otherwise
      // the page's fetch calls target a different host than the one the browser (and
      // this config's storageState) has cookies for. See the hostname note above.
      env: { NEXT_PUBLIC_API_URL: apiUrl },
    },
  ] : undefined,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chromium" },
    },
  ],
});
