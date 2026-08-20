import { readFile, readdir, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";

const buildDir = path.resolve(".next");
const manifestPath = path.join(buildDir, "app-build-manifest.json");

// Budgets are compressed transfer sizes. Keep a little headroom above the
// measured baseline so harmless hash/minifier drift does not break CI.
const budgets = {
  sharedJsKb: 95,
  routeJsKb: 25,
  firstLoadJsKb: 315,
};

// /admin is gated behind auth + admin role and never shipped to public or
// logged-out visitors — it doesn't affect SEO or Core Web Vitals the way
// member/public routes do, so it gets a looser budget instead of forcing
// every future admin feature (curriculum editor, analytics) to fight the
// same ceiling as the marketing/member surface.
const routeBudgetOverrides = {
  "/admin": { routeJsKb: 32, firstLoadJsKb: 340 },
};

const toKb = (bytes) => bytes / 1024;
const formatKb = (bytes) => `${toKb(bytes).toFixed(1)} kB`;

async function compressedSize(file) {
  let absolutePath = path.join(buildDir, file);
  try {
    await stat(absolutePath);
  } catch {
    const directory = path.dirname(absolutePath);
    const extension = path.extname(absolutePath);
    const stem = path.basename(absolutePath, extension);
    const hashedMatch = (await readdir(directory)).find(
      (entry) => entry.startsWith(`${stem}-`) && entry.endsWith(extension),
    );
    if (!hashedMatch) throw new Error(`Missing build asset: ${file}`);
    absolutePath = path.join(directory, hashedMatch);
  }
  await stat(absolutePath);
  return gzipSync(await readFile(absolutePath), { level: 9 }).byteLength;
}

function routeName(manifestKey) {
  if (manifestKey === "/page") return "/";
  return manifestKey.replace(/\/page$/, "");
}

try {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const pageEntries = Object.entries(manifest.pages).filter(([key]) =>
    key.endsWith("/page"),
  );
  if (pageEntries.length < 5) {
    throw new Error(
      "The App Router manifest is incomplete. Stop any running Next.js dev server, then run \"npm run build\" again.",
    );
  }
  const pageFileSets = pageEntries.map(([, files]) =>
    new Set(files.filter((file) => file.endsWith(".js"))),
  );
  const sharedFiles = new Set(
    [...(pageFileSets[0] ?? [])].filter((file) =>
      pageFileSets.every((files) => files.has(file)),
    ),
  );
  const sizeCache = new Map();

  const sizeOf = async (file) => {
    if (!sizeCache.has(file)) sizeCache.set(file, compressedSize(file));
    return sizeCache.get(file);
  };

  const sharedBytes = (
    await Promise.all([...sharedFiles].map((file) => sizeOf(file)))
  ).reduce((total, bytes) => total + bytes, 0);

  const routes = [];
  for (const [key, files] of pageEntries) {
    const jsFiles = [...new Set(files.filter((file) => file.endsWith(".js")))];
    const routeFiles = jsFiles.filter((file) =>
      file.includes(`/app${key === "/page" ? "/page-" : key.replace(/\/page$/, "/page-")}`),
    );
    const firstLoadBytes = (
      await Promise.all(jsFiles.map((file) => sizeOf(file)))
    ).reduce((total, bytes) => total + bytes, 0);
    const routeBytes = (
      await Promise.all(routeFiles.map((file) => sizeOf(file)))
    ).reduce((total, bytes) => total + bytes, 0);

    routes.push({ name: routeName(key), routeBytes, firstLoadBytes });
  }

  routes.sort((a, b) => b.firstLoadBytes - a.firstLoadBytes);
  const failures = [];
  const sharedLimit = budgets.sharedJsKb * 1024;

  if (sharedBytes > sharedLimit) {
    failures.push(
      `Shared JavaScript is ${formatKb(sharedBytes)} (budget: ${budgets.sharedJsKb} kB).`,
    );
  }

  for (const route of routes) {
    const override = routeBudgetOverrides[route.name];
    const routeLimitKb = override?.routeJsKb ?? budgets.routeJsKb;
    const firstLoadLimitKb = override?.firstLoadJsKb ?? budgets.firstLoadJsKb;
    if (route.routeBytes > routeLimitKb * 1024) {
      failures.push(
        `${route.name} route JavaScript is ${formatKb(route.routeBytes)} (budget: ${routeLimitKb} kB).`,
      );
    }
    if (route.firstLoadBytes > firstLoadLimitKb * 1024) {
      failures.push(
        `${route.name} first-load JavaScript is ${formatKb(route.firstLoadBytes)} (budget: ${firstLoadLimitKb} kB).`,
      );
    }
  }

  console.log(`Shared JavaScript: ${formatKb(sharedBytes)} / ${budgets.sharedJsKb} kB`);
  console.table(
    routes.map((route) => ({
      Route: route.name,
      "Route JS (gzip)": formatKb(route.routeBytes),
      "First load JS (gzip)": formatKb(route.firstLoadBytes),
    })),
  );

  if (failures.length > 0) {
    console.error("\nBundle budget exceeded:\n");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exitCode = 1;
  } else {
    console.log("Bundle budget passed.");
  }
} catch (error) {
  console.error(
    `Unable to check bundle budget. Run \"npm run build\" first.\n${error instanceof Error ? error.message : error}`,
  );
  process.exitCode = 1;
}
