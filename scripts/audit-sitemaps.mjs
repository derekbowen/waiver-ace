#!/usr/bin/env node
/**
 * Sitemap + robots audit.
 *
 * Confirms that every indexable target URL is:
 *   1. present exactly once across the sitemap set,
 *   2. in the *correct* child sitemap for its section,
 *   3. reachable from the sitemap index,
 *   4. allowed by robots.txt (and that nothing disallowed is listed),
 *   5. an absolute https://www.rentalwaivers.com URL.
 *
 * Run: node scripts/audit-sitemaps.mjs   (exit code 1 on any failure)
 */

import { build } from "esbuild";
import { promises as fs } from "fs";
import path from "path";

const BASE_URL = "https://www.rentalwaivers.com";
const PUBLIC_DIR = "public";

/* ────────────────────────── load page data ────────────────────────── */

async function loadModule(entry) {
  const result = await build({
    entryPoints: [path.resolve(entry)],
    bundle: true,
    write: false,
    format: "esm",
    platform: "neutral",
    target: "es2022",
    logLevel: "silent",
  });
  const code = result.outputFiles[0].text;
  return import("data:text/javascript;base64," + Buffer.from(code).toString("base64"));
}

/** Section definition: which child sitemap owns which URL prefix. */
const SECTIONS = [
  { file: "sitemap-core.xml", name: "core", match: (p) => !p.includes("/", 1) || CORE_PATHS.includes(p) },
  { file: "sitemap-waivers.xml", name: "waivers", match: (p) => p.startsWith("/waivers/") },
  { file: "sitemap-alternatives.xml", name: "alternatives", match: (p) => p.startsWith("/alternatives/") },
  { file: "sitemap-templates.xml", name: "templates", match: (p) => p.startsWith("/waiver-templates/") },
  { file: "sitemap-industries.xml", name: "industries", match: (p) => /^\/industries\/[^/]+$/.test(p) },
  { file: "sitemap-matrix.xml", name: "matrix", match: (p) => /^\/industries\/[^/]+\/state\//.test(p) },
  { file: "sitemap-laws.xml", name: "laws", match: (p) => p.startsWith("/waiver-laws/") },
  { file: "sitemap-blog.xml", name: "blog", match: (p) => p.startsWith("/blog/") || p === "/blog" },
];

const CORE_PATHS = [
  "/",
  "/waiver-software",
  "/rental-waiver-software",
  "/contract-scanner-info",
  "/pricing-info",
  "/industries",
  "/waiver-templates",
  "/waiver-laws",
  "/compare",
  "/updates",
  "/docs",
  "/terms",
  "/privacy",
];

function sectionFor(pathname) {
  if (CORE_PATHS.includes(pathname)) return "core";
  for (const s of SECTIONS) {
    if (s.name === "core") continue;
    if (s.match(pathname)) return s.name;
  }
  return null;
}

async function expectedPaths() {
  const [landing, alts, templates, laws, industries, blog] = await Promise.all([
    loadModule("src/lib/seo-landing-data.ts"),
    loadModule("src/lib/competitor-alt-data.ts"),
    loadModule("src/lib/waiver-template-pages.ts"),
    loadModule("src/lib/state-waiver-laws.ts"),
    loadModule("src/lib/industry-pages.ts"),
    loadModule("src/lib/blog-data.ts"),
  ]);

  const paths = new Set(CORE_PATHS);
  for (const p of landing.seoLandingPages) paths.add(`/waivers/${p.slug}`);
  for (const p of alts.competitorAltPages) paths.add(`/alternatives/${p.slug}`);
  for (const p of templates.allWaiverTemplatePages ?? templates.waiverTemplatePages)
    paths.add(`/waiver-templates/${p.slug}`);
  for (const p of laws.stateWaiverLawPages) paths.add(`/waiver-laws/${p.slug}`);
  for (const p of industries.allIndustryPages) paths.add(`/industries/${p.slug}`);
  for (const a of blog.allBlogArticles) paths.add(`/blog/${a.slug}`);
  paths.add("/blog");
  return paths;
}

/* ────────────────────────── robots.txt ────────────────────────── */

function parseRobots(text) {
  const groups = [];
  let current = null;
  for (const raw of text.split("\n")) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) continue;
    const [field, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    const key = field.trim().toLowerCase();
    if (key === "user-agent") {
      if (!current || current.rules.length) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
    } else if ((key === "allow" || key === "disallow") && current) {
      current.rules.push({ type: key, pattern: value });
    }
  }
  return groups;
}

/** Google's longest-match-wins rule matcher. */
function matchLength(pattern, pathname) {
  if (pattern === "") return -1;
  const re = new RegExp(
    "^" +
      pattern
        .replace(/[.+^${}()|[\]\\]/g, "\\$&")
        .replace(/\*/g, ".*")
        .replace(/\$$/, "$") +
      (pattern.endsWith("$") ? "" : ""),
  );
  return re.test(pathname) ? pattern.replace(/\*/g, "").length : -1;
}

function isAllowed(groups, pathname, agent = "googlebot") {
  const group =
    groups.find((g) => g.agents.includes(agent)) ?? groups.find((g) => g.agents.includes("*"));
  if (!group) return true;
  let best = { type: "allow", len: -1 };
  for (const rule of group.rules) {
    const len = matchLength(rule.pattern, pathname);
    if (len > best.len) best = { type: rule.type, len };
  }
  return best.type !== "disallow";
}

/* ────────────────────────── sitemap parsing ────────────────────────── */

async function readLocs(file) {
  const xml = await fs.readFile(path.join(PUBLIC_DIR, file), "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

/* ────────────────────────── audit ────────────────────────── */

async function main() {
  const errors = [];
  const warnings = [];

  const robotsText = await fs.readFile(path.join(PUBLIC_DIR, "robots.txt"), "utf8");
  const robots = parseRobots(robotsText);

  // 1. index references every child sitemap
  const indexLocs = await readLocs("sitemap.xml");
  for (const s of SECTIONS) {
    if (!indexLocs.includes(`${BASE_URL}/${s.file}`))
      errors.push(`sitemap.xml index is missing ${s.file}`);
  }
  for (const loc of indexLocs) {
    const file = loc.replace(`${BASE_URL}/`, "");
    try {
      await fs.access(path.join(PUBLIC_DIR, file));
    } catch {
      errors.push(`sitemap.xml index references missing file ${file}`);
    }
  }

  // 2. collect every URL from child sitemaps
  const seen = new Map(); // pathname -> file[]
  for (const s of SECTIONS) {
    for (const loc of await readLocs(s.file)) {
      if (!loc.startsWith(`${BASE_URL}/`) && loc !== `${BASE_URL}/`) {
        errors.push(`${s.file}: non-canonical or relative URL "${loc}"`);
        continue;
      }
      const pathname = loc.slice(BASE_URL.length) || "/";
      if (loc.includes("?")) errors.push(`${s.file}: URL has query string "${loc}"`);
      if (!seen.has(pathname)) seen.set(pathname, []);
      seen.get(pathname).push(s.file);

      const expectedSection = sectionFor(pathname);
      if (expectedSection && expectedSection !== s.name)
        errors.push(`${pathname} is in ${s.file} but belongs in sitemap-${expectedSection}.xml`);

      if (!isAllowed(robots, pathname))
        errors.push(`${pathname} is listed in ${s.file} but DISALLOWED by robots.txt`);
    }
  }

  // 3. duplicates
  for (const [pathname, files] of seen) {
    if (files.length > 1) errors.push(`${pathname} appears in multiple sitemaps: ${files.join(", ")}`);
  }

  // 4. every expected target URL is present + crawlable
  const expected = await expectedPaths();
  for (const pathname of expected) {
    if (!seen.has(pathname)) errors.push(`${pathname} is missing from all sitemaps`);
    if (!isAllowed(robots, pathname))
      errors.push(`${pathname} is a target page but DISALLOWED by robots.txt`);
  }

  // 5. sitemap directive present
  if (!/^Sitemap:\s*https:\/\//m.test(robotsText))
    errors.push("robots.txt has no absolute Sitemap: directive");

  // 6. orphan URLs in sitemaps that are no longer target pages (warn only —
  //    matrix pages are generated and not enumerated here)
  for (const pathname of seen.keys()) {
    if (!expected.has(pathname) && !pathname.includes("/state/"))
      warnings.push(`${pathname} is in a sitemap but is not a known target page`);
  }

  /* ── report ── */
  console.log(`Sitemaps audited: ${SECTIONS.length}`);
  console.log(`URLs in sitemaps: ${seen.size}`);
  console.log(`Target pages expected: ${expected.size}`);
  for (const w of warnings) console.log(`WARN  ${w}`);
  for (const e of errors) console.log(`FAIL  ${e}`);
  console.log(errors.length ? `\n${errors.length} failure(s)` : "\nAll checks passed");
  process.exit(errors.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
