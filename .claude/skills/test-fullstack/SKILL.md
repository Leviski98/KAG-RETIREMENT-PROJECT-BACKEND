---
name: test-fullstack
description: Use this skill whenever the user asks to test, verify, or validate a change end-to-end in the KAG Retirement backend+frontend — across the Django REST API, the Next.js UI, and the contract between them — especially with "/test-fullstack" or "test this end to end". Runs both servers, drives real auth (signup -> verify -> OTP -> login), runs the Django and Playwright suites, and specifically checks for frontend/backend field-shape drift before declaring success.
---

# Full-Stack Self-Healing Test Loop (KAG Retirement)

Use this skill for any change to `backend/` (Django REST API), `frontend/` (Next.js UI), or both, where the user expects the result verified as actually working — not just "compiles" or "unit tests pass in isolation." A change can pass its own layer's tests and still be broken at the seam between layers; this skill treats that seam as a first-class thing to check, not an afterthought.

## Project Scope

- Repo root: `C:\Users\yasmi\OneDrive\Documents\GitHub\KAG-RETIREMENT-PROJECT-BACKEND`
- `backend/`: Django 6 + DRF, SQLite, JWT-in-httpOnly-cookies auth with an email-OTP step-up. No pytest — plain `manage.py test`.
- `frontend/`: Next.js 16 (App Router) + React 19 + TypeScript. Only test tooling is Playwright (`pnpm test:e2e`); no Jest/Vitest.
- These are two independently-runnable processes talking over HTTP — there is no shared build step that would catch a field-name or shape mismatch between them. That has already bitten this project (see "Known contract gaps" below), so don't skip step 6.

## Trigger Phrases

- `/test-fullstack`
- "test this end to end", "verify this actually works", "test both frontend and backend"
- Any request to fix or change something spanning `backend/` and `frontend/` where the user expects real verification, not just a description of what should work.

## Required Tools

- Shell execution (PowerShell/Bash) for git, Django management commands, and running both dev servers in the background.
- Browser automation (in-app Browser or Chrome control) with console/network inspection and screenshots.
- File read/edit tools.

If browser automation is unavailable, still run the Django test suite and any Playwright specs headlessly, then clearly report that the visual/browser portion could not be executed.

## Protocol

### 1. Branch and Context

1. Check `git status --short --branch` in the repo root (this repo covers both `backend/` and `frontend/` — one branch, not two).
2. If on `master` with the fix already applied, confirm with the user whether to proceed on the current branch or cut a task branch — don't assume.
3. Skim `git log --oneline -10` and any files the user says they changed before touching anything else.

### 2. Start Both Servers

**Check the ports are actually free first, and check what's on them if not.** On a dev machine with other projects around, something else may already be listening on 3000 or 8000 — `curl`ing the port and getting a 200 does **not** mean the KAG frontend/backend answered; it may be an unrelated project's dev server (this has actually happened: a different repo's Next.js dev server was already bound to :3000, so a health-check loop that only checks for HTTP 200 falsely declared "both up" and a browser session then drove that other app entirely). Verify the origin, not just the status code — e.g. `curl -s http://127.0.0.1:3000/api/schema/` should be Django's OpenAPI schema, not a 404 from some other app. On Windows, `netstat -ano | findstr :3000` plus `Get-CimInstance Win32_Process -Filter "ProcessId = <pid>"` tells you what actually owns the port. If it's someone else's project, don't kill it without asking — just run KAG's servers on different ports instead (and see the CORS note below).

Run each in the background, redirecting output to a log file — the auth flow's email content only ever appears in the backend server's stdout (console email backend), so you need that log to test signup/verify/OTP for real:

```powershell
# backend (from backend/)
python manage.py runserver 127.0.0.1:8000 --noreload *> ..\backend.dev.log

# frontend (from frontend/)
pnpm dev -- --hostname 127.0.0.1 --port 3000 *> ..\frontend.dev.log
```

- Backend: `http://127.0.0.1:8000/api/...`, Swagger UI at `/api/docs/`, schema at `/api/schema/`.
- If either port is taken and you fall back to an alternate port, the two sides must agree: pass `NEXT_PUBLIC_API_URL=http://127.0.0.1:<backend-port>/api` to the frontend process, and `CORS_ORIGINS=http://127.0.0.1:<frontend-port>,http://localhost:<frontend-port>` to the backend process — CORS only allows `localhost:3000`/`127.0.0.1:3000` by default, so a frontend on any other port will fail every API call with a CORS error until this is set.
- Frontend: `http://127.0.0.1:3000`.
- If a server is already running on those ports, reuse it — don't start a second instance.
- CORS only allows `localhost:3000`/`127.0.0.1:3000` by default (`CORS_ORIGINS` env to add more) — if you see CORS errors in the console, that's almost always the frontend running on the wrong port, not a backend bug.

**Critical, confirmed-live gotcha: `localhost` and `127.0.0.1` are NOT interchangeable here, even though CORS allows both.** The auth cookies are set host-only (no `Domain=` — see `set_jwt_cookies` in `accounts/views.py`), scoped to whichever literal hostname the *backend* responded from (driven by `NEXT_PUBLIC_API_URL`, baked into the frontend bundle at build time). Reproduced directly: logged in via `http://localhost:3000` → full dashboard access; the *same already-authenticated browser* then opened `http://127.0.0.1:3000/dashboard` → silently bounced back to `/login`, no error, cookies just didn't apply. Whatever hostname you use for the frontend, `NEXT_PUBLIC_API_URL` must use that exact same hostname string. Always verify by actually reaching `/dashboard` post-login, not just by checking the login/OTP API calls succeeded.

### 3. Get an Authenticated Session

There is no seed data or fixture in this repo, and the auth flow is real friction: signup requires an emailed verification link *and* separate admin approval before login is even possible, then login only issues an OTP — it doesn't log you in. Pick the path that matches what you're testing:

**A. Fast path — not testing auth itself.** Seed a ready-to-use admin and log in directly:

```powershell
cd backend
python manage.py seed_test_admin  # idempotent; prints email/password, defaults e2e-admin@kag.test
```

Then drive the UI login -> OTP screen as normal — the OTP code for this (or any) user still prints to `backend.dev.log`, so tail that file after submitting login rather than guessing the code.

**A2. Fully scripted path — no browser/OTP step at all.** `seed_test_admin --json` mints a valid access/refresh JWT pair directly (bypassing login+OTP entirely) and prints `{email, password, access, refresh}`. This is what `frontend/tests/e2e/global-setup.ts` uses to build a Playwright `storageState` (see step 5) so specs start already authenticated. Reuse the same trick for any other scripted check that needs a session without a browser. Remember the hostname gotcha above when setting the cookie's `domain`.

**B. Real path — testing signup/verify/OTP/approval itself.** Drive the actual flow and pull tokens out of the log instead of shortcutting anything:

1. Submit signup in the browser.
2. **Don't eyeball the verification link in `backend.dev.log`.** The console email backend prints the raw MIME source, and quoted-printable transfer encoding *always* escapes a literal `=` as `=3D` and soft-wraps long lines with a trailing `=` — since every verification/reset link has a `?token=` in it, it will reliably look corrupted in the raw log (confirmed by reproduction: a real signup printed `token=3DRMskyE2GWbylo8dBu6gttfLD3f0lrWyxEF=` then a line break then `3daK-WLwo`, i.e. the actual token with `=3D`->`=` undone and the soft-wrapped line rejoined). Instead run `python manage.py get_verification_link <email>` — it issues a fresh token and prints the already-decoded, ready-to-open URL. Use `--no-send` if you don't also want it to (re-)print the raw email to the log.
3. Open that link (or POST its token to `/api/auth/verify-email`).
4. Approve the new user via `seed_test_admin`'s admin account (`GET /api/auth/users/pending` then `POST /api/auth/users/<id>/approve/`) — check whether `frontend/app/dashboard/users` actually exercises this before falling back to the API directly, and flag it if it doesn't.
5. Submit login, read the OTP code from `backend.dev.log` ("Your one-time sign-in code is: ######" — plain digits, not subject to the quoted-printable trap above), submit it.
6. Confirm the `kag_access`/`kag_refresh` httpOnly cookies are set (check via browser devtools/network, not `document.cookie` — they're httpOnly) and `/dashboard` loads without redirect.

**Recovering a stuck signup:** if a verification link expired (24h TTL) or was corrupted by manual log-reading before this skill existed, don't try to re-signup with the same email — `username=email` is unique, so it will fail. Run `python manage.py get_verification_link <email>` instead; it works on any existing unverified user and invalidates their old token.

Never print the OTP code, verification token, or password in your final summary to the user.

### 4. Backend Verification

1. Run the Django suite for any app you touched, plus `accounts` and `reports` (the only apps with real test coverage today): `python manage.py test accounts reports <other_touched_app>`. `reports/tests.py` authenticates via `self.client.force_authenticate(user=...)` in `setUp` (fixed — it used to build a bare unauthenticated `APIClient()` and fail 3/4 tests with 401 once `DEFAULT_PERMISSION_CLASSES` went global-`IsAuthenticated`). If you add a new app's test suite, use the same pattern rather than a raw `APIClient()`.
2. If you touched a serializer, view, or model with only a stub `tests.py` (`app_settings`, `churches`, `districts`, `pastors`, `sections` all currently have none), write real test cases for the code path you changed rather than leaving it at `# Create your tests here.` — don't let coverage regress silently.
3. Smoke-test the actual endpoint with an authenticated request (curl/httpie/Python `requests`, cookie jar from step 3) for anything not covered by `manage.py test`, especially permission checks — `DEFAULT_PERMISSION_CLASSES` is `IsAuthenticated` globally, so verify a change didn't accidentally loosen or over-tighten that for the touched viewset.
4. `python manage.py spectacular --validate` is **not** clean on this repo today (~70+ pre-existing warnings from `JWTCookieAuthentication` having no `OpenApiAuthenticationExtension`, several APIViews with no inferable serializer, and a real pre-existing bug in `reports/views.py`'s PDF endpoints using `application/pdf` where an HTTP status code belongs) — don't run it with `--fail-on-warn` and treat any failure as yours. Instead, after touching a serializer/view, just confirm `curl http://127.0.0.1:8000/api/schema/` still returns 200 and grep the output for warnings/errors naming the file you touched specifically.

### 5. Frontend Verification

1. If a Playwright spec covers the touched page (`frontend/tests/e2e/*.spec.ts`), run it: `pnpm test:e2e` (or `-g "<name>"` to scope it). Every spec now starts authenticated: `globalSetup` (`tests/e2e/global-setup.ts`) calls `seed_test_admin --json` and writes the resulting JWT pair into `tests/e2e/.auth/admin.json`, which `playwright.config.ts`'s `use.storageState` applies to both the browser context and the `request`/`e2eApi` fixture (fixed — these specs used to navigate straight to `/dashboard/*` with zero auth and 401/redirect against `IsAuthenticated` + the cookie-guard middleware). `frontendUrl`/`apiUrl` are exported from `playwright.config.ts` and imported wherever else a host is needed (`global-setup.ts`, `support/api.ts`) specifically so the hostname-consistency rule above can't silently drift between copies again — don't reintroduce a separate hardcoded default in a new file.
2. `PLAYWRIGHT_MANAGE_SERVERS=true` needs `python` (with the project's deps installed) and `npm`/`node_modules` on `PATH`/present — point `PATH` at the right interpreter if the system one lacks Django. In some sandboxed environments the downloaded Chromium binary itself can't be launched (`spawn UNKNOWN` / `Permission denied` executing `chrome.exe` directly, confirmed unrelated to any project or Playwright config issue) — if that happens, verify everything up to the browser launch (global-setup's token mint + storageState file are the parts under this project's control) and have the user run `pnpm test:e2e` themselves in a normal terminal for the final confirmation, per the "browser automation unavailable" fallback above.
2. For anything not covered by an existing spec, drive it manually in the browser per the interaction pattern below, using the session from step 3.
3. Use resilient locators (role/label/text), not brittle XPath. Populate realistic domain data (Kenyan phone format `+2547XXXXXXXX` per `support/api.ts`'s `uniquePhone`, valid `pastor_rank`/`status` enum values).
4. Watch the network tab for the actual request/response, not just the UI's optimistic state — React Query can show a success toast from cache/optimistic update before confirming the server accepted it.

### 6. Integration Contract Check (the gap this project keeps hitting)

This is the step that catches what neither test suite catches on its own: the backend and frontend evolve their idea of a shape independently, and nothing fails loudly when they drift — a field just silently comes back `undefined` in the UI.

1. For every serializer field you touched (`backend/*/serializers.py`), grep the frontend for the same field name: `types/*.ts`, `lib/api/*.ts`, and the component(s) that render it. Confirm the name matches exactly (this codebase is consistently snake_case end-to-end — a camelCase frontend field for something the backend sends snake_case is itself a bug, not a style choice) and that nested-vs-flat shape matches (e.g. a `summary()`-style endpoint returning `{ pastor: {...}, age, years_of_service }` vs a frontend type that flattens it).
2. Cross-check against `/api/schema/` (fetch it while the backend is running) as the source of truth for what the API actually returns today, rather than trusting either side's hand-written types.
3. Re-check the specific mismatches already known in this codebase to confirm they're still there (regression baseline) or newly fixed — don't let a fix to one silently miss the others:
   - `SectionStatistics.sections_per_district` (frontend `types/section.ts`) vs the backend's actual `sections_by_district` key (`sections/views.py`).
   - `SectionSummary` frontend type expects `churches_count`; backend `summary()` doesn't send it (commented out).
   - `PastorSummary` frontend type is flat (`extends Pastor`); backend `summary()` returns nested `{ pastor, age, years_of_service }`.
   - `SystemSettings.email_summary_frequency` exists on the backend serializer, absent from `frontend/types/settings.ts`.
   - "Purge Data" button in Settings > Data Management has no backing `app_settings` endpoint — it's UI-only today.
4. If you find a new mismatch, fix the side that's wrong (usually the frontend type/usage, unless the backend field is the one that's actually misnamed) rather than just reporting it — but call out any mismatch you didn't fix in the handoff.

### 7. Observe, Diagnose, Self-Heal

If any layer fails:

1. Capture a screenshot, browser console errors, and the failing network request/response body.
2. Capture the relevant `backend.dev.log` traceback if the failure is server-side.
3. Correlate to source, patch, re-run the narrowest check that failed (not the whole suite), then retest the full path.

Repeat up to 3 times. After 3 failed cycles, stop and hand back to the user with the screenshots/errors/logs summarized rather than continuing to guess.

### 8. Required Handoff

- Branch used.
- Files changed (backend/frontend/both).
- Django test command(s) run and result.
- Playwright spec(s) run and result — explicitly flag if a spec's auth gap (see step 5) makes its "pass" not trustworthy.
- Browser path exercised manually, with the auth path used (seeded admin vs real signup flow).
- Contract check result: which serializer/type pairs were checked, and the status of the known mismatches list.
- Any test gaps left (stub `tests.py` files not filled in, specs not fixed) — state these plainly rather than letting a green run imply full coverage.
