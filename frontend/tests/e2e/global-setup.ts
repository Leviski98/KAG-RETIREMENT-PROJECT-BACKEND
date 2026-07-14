import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { apiUrl, frontendUrl } from "../../playwright.config";

/**
 * Logs a seeded test admin in once and saves the result as a Playwright
 * storageState, so every spec starts already authenticated instead of each
 * one re-driving signup -> verify -> approve -> login -> OTP by hand (which
 * also can't be scripted without reading the OTP out of the console email
 * backend's log). `seed_test_admin --json` mints the JWT pair directly.
 *
 * Cookie domain must be the exact hostname (not IP-equivalent) used by both
 * PLAYWRIGHT_BASE_URL and PLAYWRIGHT_API_URL: the backend sets these cookies
 * host-only (no `Domain=`), so "localhost" and "127.0.0.1" are different
 * cookie jars even on the same machine/port -- confirmed live: a session
 * logged in via localhost:3000 was silently signed out when the same browser
 * opened 127.0.0.1:3000. Mismatched hosts here would reproduce that bug for
 * every spec, not just fail loudly, so this throws early instead.
 */
export default function globalSetup() {
  const frontendHost = new URL(frontendUrl).hostname;
  const apiHost = new URL(apiUrl).hostname;
  if (frontendHost !== apiHost) {
    throw new Error(
      `PLAYWRIGHT_BASE_URL host (${frontendHost}) and PLAYWRIGHT_API_URL host (${apiHost}) must match exactly ` +
        `-- the auth cookies are host-only, so e.g. "localhost" vs "127.0.0.1" silently breaks every authenticated spec.`
    );
  }

  const pythonCommand = process.platform === "win32" ? "python" : "python3";
  const backendDir = path.resolve(__dirname, "../../../backend");

  const output = execFileSync(
    pythonCommand,
    ["manage.py", "seed_test_admin", "--json"],
    { cwd: backendDir, encoding: "utf-8" }
  );
  const jsonLine = output.trim().split("\n").findLast((line) => line.startsWith("{"));
  if (!jsonLine) {
    throw new Error(`seed_test_admin --json produced no JSON output:\n${output}`);
  }
  const { access, refresh } = JSON.parse(jsonLine);

  const nowSeconds = Math.floor(new Date().getTime() / 1000);
  const cookie = (name: string, value: string, maxAgeSeconds: number) => ({
    name,
    value,
    domain: frontendHost,
    path: "/",
    expires: nowSeconds + maxAgeSeconds,
    httpOnly: true,
    secure: false,
    sameSite: "Lax" as const,
  });

  const storageState = {
    cookies: [
      cookie("kag_access", access, 30 * 60),
      cookie("kag_refresh", refresh, 7 * 24 * 60 * 60),
    ],
    origins: [],
  };

  const authDir = path.resolve(__dirname, ".auth");
  mkdirSync(authDir, { recursive: true });
  writeFileSync(path.join(authDir, "admin.json"), JSON.stringify(storageState, null, 2));
}
