import { Link } from "react-router-dom";
import { SeoPageLayout } from "@/components/SeoPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { blogArticles } from "@/lib/blog-data";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { breadcrumbSchema } from "@/lib/structured-data";

export default function BlogHubPage() {
  return (
    <SeoPageLayout
      metaTitle="Waiver Blog — Expert Guides for Rental & Recreation Businesses"
      metaDescription="In-depth articles on liability waivers, legal protection, risk management, and digital waiver best practices for rental and recreation business owners."
      canonicalPath="/blog"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", url: "https://www.rentalwaivers.com/" },
              { name: "Blog", url: "https://www.rentalwaivers.com/blog" },
            ])
          ),
        }}
      />

      <section className="container py-16 md:py-24 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium mb-6 bg-primary/5 text-primary border-primary/20">
          <Tag className="h-3 w-3" /> Expert Waiver Guides
        </div>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight mb-4">
          The Rental Waivers Blog
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          In-depth guides on liability waivers, legal protection, and risk management for rental and recreation businesses.
        </p>
      </section>

      <section className="container max-w-5xl pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          {blogArticles.map((article) => (
            <Link key={article.slug} to={`/blog/${article.slug}`} className="group">
              <Card className="h-full transition-shadow hover:shadow-lg">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 font-medium">
                      {article.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {article.readTime}
                    </span>
                  </div>
                  <h2 className="font-heading text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-sm text-muted-foreground flex-1 mb-4">
                    {article.metaDescription}
                  </p>
                  <span className="text-sm font-medium text-primary flex items-center gap-1">
                    Read article <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </SeoPageLayout>
  );
}
