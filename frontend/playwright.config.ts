import { defineConfig, devices } from "@playwright/test";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const pythonCommand = process.platform === "win32" ? "python" : "python3";

const frontendUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const apiUrl = process.env.PLAYWRIGHT_API_URL ?? "http://127.0.0.1:8000/api";
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
  use: {
    baseURL: frontendUrl,
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
    },
  ] : undefined,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chromium" },
    },
  ],
});
