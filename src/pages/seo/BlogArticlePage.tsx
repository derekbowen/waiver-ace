import { useParams, Link } from "react-router-dom";
import { SeoPageLayout, SeoFaq, SeoCta } from "@/components/SeoPageLayout";
import { getBlogArticle, getRelatedArticles } from "@/lib/blog-data";
import { Card, CardContent } from "@/components/ui/card";
import { AiQuestionBox } from "@/components/AiQuestionBox";
import { InternalLinks } from "@/components/InternalLinks";
import { breadcrumbSchema, faqSchema } from "@/lib/structured-data";
import { Clock, User, Calendar, ArrowRight } from "lucide-react";
import NotFound from "@/pages/NotFound";

export default function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getBlogArticle(slug) : undefined;

  if (!article) return <NotFound />;

  const related = getRelatedArticles(article.relatedSlugs);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    author: { "@type": "Organization", name: article.author },
    datePublished: article.publishedDate,
    dateModified: article.updatedDate,
    publisher: {
      "@type": "Organization",
      name: "Rental Waivers",
      url: "https://www.rentalwaivers.com",
    },
    mainEntityOfPage: `https://www.rentalwaivers.com/blog/${article.slug}`,
  };

  return (
    <SeoPageLayout
      metaTitle={article.metaTitle}
      metaDescription={article.metaDescription}
      canonicalPath={`/blog/${article.slug}`}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", url: "https://www.rentalwaivers.com/" },
              { name: "Blog", url: "https://www.rentalwaivers.com/blog" },
              { name: article.title, url: `https://www.rentalwaivers.com/blog/${article.slug}` },
            ])
          ),
        }}
      />

      {/* Hero */}
      <header className="container max-w-3xl py-12 md:py-20">
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
          <span>/</span>
          <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 font-medium">{article.category}</span>
        </div>
        <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
          {article.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {article.author}</span>
          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Updated {article.updatedDate}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {article.readTime}</span>
        </div>
      </header>

      {/* Featured snippet */}
      <section className="container max-w-3xl pb-8">
        <div className="rounded-lg border bg-primary/5 p-5">
          <p className="text-sm font-medium text-primary mb-1">Quick Answer</p>
          <p className="text-sm text-foreground leading-relaxed">{article.featuredSnippet}</p>
        </div>
      </section>

      {/* Table of contents */}
      <nav className="container max-w-3xl pb-10">
        <p className="text-sm font-semibold mb-3">In this article</p>
        <ol className="list-decimal list-inside space-y-1">
          {article.sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {s.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* Article body */}
      <article className="container max-w-3xl pb-16">
        {article.sections.map((section) => (
          <section key={section.id} id={section.id} className="mb-12 scroll-mt-20">
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-5">{section.heading}</h2>
            <div
              className="prose prose-sm md:prose-base max-w-none text-muted-foreground
                prose-headings:text-foreground prose-headings:font-heading
                prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
                prose-p:leading-relaxed prose-li:leading-relaxed
                prose-strong:text-foreground prose-em:text-foreground
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </section>
        ))}
      </article>

      {/* FAQ */}
      <SeoFaq items={article.faq} />

      {/* Related articles */}
      {related.length > 0 && (
        <section className="container max-w-4xl py-16">
          <h2 className="font-heading text-2xl font-bold mb-8 text-center">Related Articles</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {related.map((r) => (
              <Link key={r.slug} to={`/blog/${r.slug}`} className="group">
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    <p className="text-xs text-muted-foreground mb-2">{r.category}</p>
                    <h3 className="font-heading text-sm font-bold group-hover:text-primary transition-colors mb-2">
                      {r.title}
                    </h3>
                    <span className="text-xs text-primary flex items-center gap-1">
                      Read <ArrowRight className="h-3 w-3" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* AI Q&A */}
      <section className="container max-w-3xl py-12">
        <AiQuestionBox
          contextLabel={article.title}
          contextHint={`Ask any question about ${article.title.toLowerCase()}`}
        />
      </section>

      {/* Internal links */}
      <InternalLinks />

      {/* CTA */}
      <SeoCta
        headline="Protect Your Business with Digital Waivers"
        subtext="Get started with legally enforceable digital waivers—no monthly fee, starting at 6¢ per waiver."
      />
    </SeoPageLayout>
  );
}
