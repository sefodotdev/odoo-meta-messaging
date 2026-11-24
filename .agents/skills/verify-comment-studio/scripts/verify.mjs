#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import { chromium, expect } from "@playwright/test";
import { testBackend } from "../../../../scripts/test-backend.mjs";
import { freePort } from "../../../../scripts/local-convex.mjs";

const root = fileURLToPath(new URL("../../../..", import.meta.url));
process.chdir(root);
const evidence = resolve(
  process.argv[2] ||
    `data/verification/comment-studio/${new Date().toISOString().replaceAll(":", "-")}`,
);
// Refuse reuse so a failed run cannot overwrite an earlier proof.
mkdirSync(evidence, { recursive: true, mode: 0o700 });
const reportPath = join(evidence, "report.json");
assert.ok(!existsSync(reportPath), "Use a fresh evidence directory.");
const buildPath = resolve(".next-validation/BUILD_ID");
assert.ok(
  existsSync(buildPath),
  "First run NEXT_VALIDATION_BUILD=true npm run build.",
);
const envFiles = readdirSync(root).filter((name) => name.startsWith(".env"));
const fingerprints = () =>
  Object.fromEntries(
    envFiles.map((name) => [
      name,
      createHash("sha256").update(readFileSync(name)).digest("hex"),
    ]),
  );
const before = fingerprints();
// Prevent Next's automatic .env loading from filling in real service credentials.
const isolatedEnv = { ...process.env };
for (const name of envFiles)
  for (const key of Object.keys(parseEnv(readFileSync(name, "utf8"))))
    isolatedEnv[key] = "";
for (const key of Object.keys(isolatedEnv))
  if (
    /^(META_|CLERK_|NEXT_PUBLIC_CLERK_|CONVEX_|NEXT_PUBLIC_CONVEX_|OPENAI_|AI_STEP_|DYNAMIC_CONTENT_)/.test(
      key,
    )
  )
    isolatedEnv[key] = "";
const report = {
  feature: "contacts-library.library-folder",
  entryPoint: "Automation → Create folder → folder link → reload",
  mode: "automated verification; local backend; legacy authentication",
  liveMetaAcceptance: "not run; real delivery disabled",
  build: readFileSync(buildPath, "utf8").trim(),
  steps: [],
  network: [],
  blockedExternal: [],
  cleanup: {},
  result: "running",
};
const save = () =>
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n", {
    mode: 0o600,
  });
const step = (action, result) => {
  report.steps.push({ at: new Date().toISOString(), action, result });
  save();
};
let backend,
  child,
  browser,
  page,
  logs = "",
  interrupted = false;
const stop = () => {
  interrupted = true;
  void browser?.close();
  child?.kill("SIGTERM");
};
process.once("SIGINT", stop);
process.once("SIGTERM", stop);
const stopChild = async () => {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  await new Promise((done) => {
    const timer = setTimeout(() => child.kill("SIGKILL"), 3000);
    child.once("exit", () => {
      clearTimeout(timer);
      done();
    });
    child.kill("SIGTERM");
  });
};
const capture = async (name) => {
  await page.screenshot({
    path: join(evidence, `${name}.png`),
    fullPage: true,
  });
  writeFileSync(
    join(evidence, `${name}.aria.txt`),
    await page.locator("body").ariaSnapshot(),
  );
};
save();
try {
  const origin = `http://127.0.0.1:${await freePort()}`;
  const password = randomBytes(24).toString("hex");
  backend = await testBackend({
    APP_URL: origin,
    OWNER_PASSWORD: password,
    DELIVERY_MODE: "disabled",
    APP_ENVIRONMENT: "test",
    ALLOW_DEVELOPMENT_DELIVERY: "false",
    META_APP_ID: "",
    META_APP_SECRET: "",
    META_WEBHOOK_VERIFY_TOKEN: "",
  });
  assert.ok(!interrupted, "Verification interrupted during backend setup.");
  report.origin = origin;
  report.backend = backend.url;
  child = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      new URL(origin).port,
    ],
    {
      env: {
        ...isolatedEnv,
        ...backend.env,
        NODE_ENV: "production",
        NEXT_VALIDATION_BUILD: "true",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  child.on("error", (error) => {
    logs += error.message;
  });
  for (const stream of [child.stdout, child.stderr])
    stream.on("data", (data) => {
      logs = (logs + data).slice(-12000);
    });
  report.pid = child.pid;
  let ready = false;
  for (let i = 0; i < 100; i++) {
    assert.ok(
      !interrupted && child.exitCode === null,
      "Owned server stopped before readiness.",
    );
    try {
      ready = (await fetch(origin, { signal: AbortSignal.timeout(1000) })).ok;
    } catch {}
    if (ready) break;
    await new Promise((done) => setTimeout(done, 200));
  }
  assert.ok(ready, "Owned Next server did not become ready.");
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    serviceWorkers: "block",
  });
  await context.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) {
      report.blockedExternal.push({
        origin: url.origin,
        method: route.request().method(),
      });
      return route.abort();
    }
    return route.continue();
  });
  page = await context.newPage();
  page.setDefaultTimeout(15000);
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  // Store no headers, cookies, request bodies, or authorization query strings.
  page.on("response", (response) => {
    report.network.push({
      method: response.request().method(),
      path: new URL(response.url()).pathname,
      status: response.status(),
    });
  });
  await page.goto(origin);
  await page
    .getByRole("textbox", { name: "Workspace name", exact: true })
    .fill("owner");
  await page
    .getByRole("textbox", { name: "Workspace password", exact: true })
    .fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome", exact: true, level: 1 }),
  ).toBeVisible();
  step(
    "Launch: disposable backend + owned Next process; sign in through workspace form",
    "Authenticated home visible",
  );

  // Doctor is read-only: check both backends, anonymous denial and authenticated scope/gate.
  assert.equal(child.exitCode, null);
  assert.equal(readFileSync(buildPath, "utf8").trim(), report.build);
  const version = await fetch(`${backend.url}/version`);
  assert.ok(version.ok);
  assert.equal((await fetch(`${origin}/api/folders`)).status, 401);
  const settings = await context.request.get(`${origin}/api/settings`);
  assert.equal(settings.status(), 200);
  assert.equal((await settings.json()).name, "My workspace");
  const readiness = await context.request.get(`${origin}/api/readiness`);
  assert.equal(readiness.status(), 200);
  report.readinessBefore = await readiness.json();
  assert.equal(report.readinessBefore.delivery.enabled, false);
  assert.equal(report.readinessBefore.delivery.environment, "test");
  assert.equal(report.readinessBefore.evidence.accepted, 0);
  step(
    "Doctor: owned process, build, backend /version, 401 without session, scoped settings, disabled delivery",
    "passed",
  );
  await page.getByRole("link", { name: "Automation", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Create folder", exact: true }),
  ).toBeVisible();
  await capture("01-before");
  step(
    "Click Create folder; fill Folder name with Verification folder; click Save folder",
    "action started",
  );
  await page
    .getByRole("button", { name: "Create folder", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("textbox", { name: "Folder name" })
    .fill("Verification folder");
  await capture("02-action");
  await dialog
    .getByRole("button", { name: "Save folder", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  const folderLink = page
    .locator(".library-folder")
    .getByRole("link", { name: "Verification folder", exact: true });
  await expect(folderLink).toBeVisible();
  const folders = await context.request.get(`${origin}/api/folders`);
  assert.equal(folders.status(), 200);
  const folder = (await folders.json()).find(
    (entry) => entry.name === "Verification folder",
  );
  assert.ok(
    folder?.id,
    "Second user-facing API view must contain the saved folder.",
  );
  report.savedFolder = folder;
  const stored = await backend.record("folders", folder.id);
  assert.equal(stored.workspace, "owner");
  step(
    "Save folder; independently read /api/folders and persisted Convex row",
    `folder ${folder.id} belongs to owner`,
  );
  await folderLink.click();
  await expect(page).toHaveURL(
    (url) =>
      url.pathname === "/automation" &&
      url.searchParams.get("folder") === folder.id,
  );
  await page.reload();
  await expect(
    page.getByRole("navigation", { name: "Folder breadcrumbs" }),
  ).toContainText("Verification folder");
  assert.equal(new URL(page.url()).searchParams.get("folder"), folder.id);
  await capture("03-persisted");
  step(
    "Open folder link and reload its URL",
    "Saved folder breadcrumb persists",
  );
  report.sideEffects = {};
  for (const table of ["jobs", "delivery_attempts", "contacts", "runs"])
    assert.equal(
      (report.sideEffects[table] = (await backend.rows(table)).length),
      0,
      `${table} must remain empty`,
    );
  const after = await context.request.get(`${origin}/api/readiness`);
  assert.equal(after.status(), 200);
  report.readinessAfter = await after.json();
  assert.equal(report.readinessAfter.delivery.enabled, false);
  assert.equal(report.readinessAfter.evidence.accepted, 0);
  assert.deepEqual(pageErrors, []);
  step(
    "Inspect jobs, attempts, contacts, runs and readiness after UI action",
    "All zero; real delivery still disabled",
  );
  report.result = "passed";
} catch (error) {
  report.result = "failed";
  report.error = error.message;
  if (page && !page.isClosed()) await capture("failure").catch(() => {});
  process.exitCode = 1;
} finally {
  try {
    await browser?.close();
  } catch (error) {
    report.cleanup.browserError = error.message;
    process.exitCode = 1;
  }
  try {
    await stopChild();
  } catch (error) {
    report.cleanup.serverError = error.message;
    process.exitCode = 1;
  }
  try {
    await backend?.close();
  } catch (error) {
    report.cleanup.backendError = error.message;
    process.exitCode = 1;
  }
  report.cleanup.serverStopped =
    !child || child.exitCode !== null || child.signalCode !== null;
  report.cleanup.backendScratchRemoved = !backend || !existsSync(backend.dir);
  report.cleanup.envFilesUnchanged =
    JSON.stringify(before) === JSON.stringify(fingerprints());
  writeFileSync(join(evidence, "server.log"), logs, { mode: 0o600 });
  if (
    !report.cleanup.serverStopped ||
    !report.cleanup.backendScratchRemoved ||
    !report.cleanup.envFilesUnchanged
  )
    process.exitCode = 1;
  if (process.exitCode) report.result = "failed";
  save();
  assert.ok(existsSync(reportPath), "Cleanup removed the proof.");
  console.log(`${report.result}: ${reportPath}`);
}
