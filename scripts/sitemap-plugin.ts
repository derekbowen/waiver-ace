import { build } from "esbuild";
import { promises as fs } from "fs";
import path from "path";
import type { Plugin } from "vite";

const BASE_URL = "https://www.rentalwaivers.com";
const BLOG_SITEMAP = "public/sitemap-blog.xml";
const SITEMAP_INDEX = "public/sitemap.xml";

interface BlogArticle {
  slug: string;
  publishedDate: string;
  updatedDate: string;
}

async function loadBlogArticles(): Promise<BlogArticle[]> {
  const result = await build({
    entryPoints: [path.resolve("src/lib/blog-data.ts")],
    bundle: true,
    write: false,
    format: "esm",
    platform: "neutral",
    target: "es2022",
    logLevel: "silent",
  });
  const code = result.outputFiles[0].text;
  const dataUrl =
    "data:text/javascript;base64," + Buffer.from(code).toString("base64");
  const mod = await import(dataUrl);
  return mod.allBlogArticles as BlogArticle[];
}

function buildBlogSitemap(articles: BlogArticle[], hubLastmod: string): string {
  const urls: { loc: string; lastmod: string }[] = [
    { loc: `${BASE_URL}/blog`, lastmod: hubLastmod },
    ...articles.map((a) => ({
      loc: `${BASE_URL}/blog/${a.slug}`,
      lastmod: a.updatedDate || a.publishedDate,
    })),
  ];

  const body = urls
    .map(
      ({ loc, lastmod }, i) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${i === 0 ? "weekly" : "monthly"}</changefreq>
    <priority>${i === 0 ? "0.8" : "0.7"}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

async function updateSitemapIndex(blogLastmod: string) {
  const filePath = path.resolve(SITEMAP_INDEX);
  const xml = await fs.readFile(filePath, "utf8");
  const updated = xml.replace(
    /(<loc>[^<]*sitemap-blog\.xml<\/loc>\s*<lastmod>)[^<]+(<\/lastmod>)/,
    `$1${blogLastmod}$2`
  );
  if (updated !== xml) await fs.writeFile(filePath, updated);
}

export async function generateBlogSitemap() {
  const articles = await loadBlogArticles();
  const latest = articles
    .map((a) => a.updatedDate || a.publishedDate)
    .filter(Boolean)
    .sort()
    .pop()!;
  const xml = buildBlogSitemap(articles, latest);
  await fs.writeFile(path.resolve(BLOG_SITEMAP), xml);
  await updateSitemapIndex(latest);
  // eslint-disable-next-line no-console
  console.log(
    `[sitemap] Generated sitemap-blog.xml with ${articles.length} articles (lastmod ${latest})`
  );
}

export function sitemapPlugin(): Plugin {
  return {
    name: "rentalwaivers-sitemap-generator",
    apply: "build",
    async buildStart() {
      try {
        await generateBlogSitemap();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[sitemap] Generation failed:", err);
      }
    },
  };
}
