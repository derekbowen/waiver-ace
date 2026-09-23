// Generates public/sitemap-integrations.xml from the integration page network.
// Run: bun scripts/generate-integration-sitemap.mjs
import fs from "node:fs";
import path from "node:path";

const BASE = "https://www.rentalwaivers.com";
const today = new Date().toISOString().slice(0, 10);

function slugsFrom(file, re) {
  const src = fs.readFileSync(file, "utf8");
  return [...src.matchAll(re)].map((m) => m[1]);
}

const platforms = slugsFrom("src/lib/integration-pages.ts", /^\s{4}slug: "([a-z0-9-]+)",/gm);
const industries = [
  ...slugsFrom("src/lib/industry-pages.ts", /slug: "([a-z0-9-]+)"/g),
  ...slugsFrom("src/lib/industry-pages-extra.ts", /slug: "([a-z0-9-]+)"/g),
].filter((s) => s.includes("waiver-software"));
const states = slugsFrom("src/lib/state-waiver-laws.ts", /^\s{4}slug: "([a-z-]+)",/gm);

const urls = [
  { loc: "/integrations", pri: "0.9", freq: "weekly" },
  ...platforms.map((p) => ({ loc: `/integrations/${p}`, pri: "0.9", freq: "weekly" })),
  ...platforms.flatMap((p) => industries.map((i) => ({ loc: `/integrations/${p}/${i}`, pri: "0.7", freq: "monthly" }))),
  ...platforms.flatMap((p) => states.map((s) => ({ loc: `/integrations/${p}/state/${s}`, pri: "0.6", freq: "monthly" }))),
];

const body = urls
  .map(
    (u) =>
      `  <url>\n    <loc>${BASE}${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.pri}</priority>\n  </url>`
  )
  .join("\n");

fs.writeFileSync(
  path.join("public", "sitemap-integrations.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
);

console.log(
  `platforms=${platforms.length} industries=${industries.length} states=${states.length} total_urls=${urls.length}`
);
