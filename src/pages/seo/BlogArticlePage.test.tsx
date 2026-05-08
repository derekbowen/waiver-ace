import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import BlogArticlePage from "./BlogArticlePage";
import { allBlogArticles } from "@/lib/blog-data";

// Pick the first article that has FAQ entries.
const sample = allBlogArticles.find((a) => a.faq && a.faq.length > 0);

vi.mock("@/components/AiQuestionBox", () => ({
  AiQuestionBox: () => null,
}));
vi.mock("@/components/InternalLinks", () => ({
  InternalLinks: () => null,
}));

function renderArticle(slug: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/blog/${slug}`]}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogArticlePage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe("BlogArticlePage JSON-LD", () => {
  beforeAll(() => {
    if (!sample) throw new Error("No blog article with FAQ found for test");
  });

  it("renders valid BlogPosting, BreadcrumbList and FAQPage JSON-LD", () => {
    const { container } = renderArticle(sample!.slug);

    const scripts = Array.from(
      container.querySelectorAll('script[type="application/ld+json"]')
    );
    expect(scripts.length).toBeGreaterThanOrEqual(3);

    const parsed = scripts.map((s) => {
      const json = JSON.parse(s.textContent || "{}");
      expect(json["@context"]).toBe("https://schema.org");
      return json;
    });

    const types = parsed.map((p) => p["@type"]);
    expect(types).toContain("BlogPosting");
    expect(types).toContain("BreadcrumbList");
    expect(types).toContain("FAQPage");

    const blogPosting = parsed.find((p) => p["@type"] === "BlogPosting");
    expect(blogPosting.headline).toBe(sample!.title);
    expect(blogPosting.datePublished).toBe(sample!.publishedDate);
    expect(blogPosting.dateModified).toBe(sample!.updatedDate);
    expect(typeof blogPosting.articleBody).toBe("string");
    expect(blogPosting.articleBody.length).toBeGreaterThan(0);
    expect(blogPosting.wordCount).toBeGreaterThan(0);
    expect(blogPosting.publisher?.name).toBe("Rental Waivers");
    expect(blogPosting.mainEntityOfPage?.["@id"]).toContain(`/blog/${sample!.slug}`);

    const breadcrumbs = parsed.find((p) => p["@type"] === "BreadcrumbList");
    expect(Array.isArray(breadcrumbs.itemListElement)).toBe(true);
    expect(breadcrumbs.itemListElement.length).toBe(3);
    expect(breadcrumbs.itemListElement[0].position).toBe(1);

    const faq = parsed.find((p) => p["@type"] === "FAQPage");
    expect(faq.mainEntity.length).toBe(sample!.faq.length);
    for (const entity of faq.mainEntity) {
      expect(entity["@type"]).toBe("Question");
      expect(typeof entity.name).toBe("string");
      expect(entity.acceptedAnswer?.["@type"]).toBe("Answer");
      expect(typeof entity.acceptedAnswer?.text).toBe("string");
    }
  });

  it("omits FAQPage JSON-LD when article has no FAQ", () => {
    const noFaqArticle = { ...sample!, slug: "__test_no_faq__", faq: [] };
    const mod = require("@/lib/blog-data");
    const original = mod.getBlogArticle;
    mod.getBlogArticle = (s: string) =>
      s === noFaqArticle.slug ? noFaqArticle : original(s);

    try {
      const { container } = renderArticle(noFaqArticle.slug);
      const scripts = Array.from(
        container.querySelectorAll('script[type="application/ld+json"]')
      );
      const types = scripts.map(
        (s) => JSON.parse(s.textContent || "{}")["@type"]
      );
      expect(types).toContain("BlogPosting");
      expect(types).toContain("BreadcrumbList");
      expect(types).not.toContain("FAQPage");
    } finally {
      mod.getBlogArticle = original;
    }
  });
});
