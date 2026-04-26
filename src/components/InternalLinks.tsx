import { Link } from "react-router-dom";
import { seoLandingPages } from "@/lib/seo-landing-data";
import { competitorAltPages } from "@/lib/competitor-alt-data";
import { allBlogArticles } from "@/lib/blog-data";
import { stateLawPages } from "@/lib/state-waiver-laws";

interface InternalLinksProps {
  /** Current page slug to exclude from links */
  currentSlug?: string;
  /** "landing" | "competitor" — which type of page we're on */
  pageType?: "landing" | "competitor";
}

export function InternalLinks({ currentSlug }: InternalLinksProps) {
  const popularLandings = seoLandingPages
    .filter((p) => p.slug !== currentSlug)
    .slice(0, 6);

  const competitors = competitorAltPages
    .filter((p) => p.slug !== currentSlug)
    .slice(0, 5);

  const popularStates = stateLawPages
    .filter((s) => s.slug !== currentSlug)
    .slice(0, 6);

  const popularBlogs = allBlogArticles
    .filter((b) => b.slug !== currentSlug)
    .slice(0, 5);

  return (
    <section className="border-t py-12 bg-muted/20">
      <div className="container max-w-6xl">
        <h2 className="font-heading text-lg font-bold mb-6 text-center">Explore More</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Waiver Types</h3>
            <ul className="space-y-1.5">
              {popularLandings.map((p) => (
                <li key={p.slug}>
                  <Link to={`/waivers/${p.slug}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {p.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/industries" className="text-primary font-medium hover:underline">
                  All industries →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-foreground">Waiver Laws by State</h3>
            <ul className="space-y-1.5">
              {popularStates.map((s) => (
                <li key={s.slug}>
                  <Link to={`/waiver-laws/${s.slug}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {s.state} waiver laws
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/waiver-laws" className="text-primary font-medium hover:underline">
                  All 50 states →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-foreground">Compare Alternatives</h3>
            <ul className="space-y-1.5">
              {competitors.map((p) => (
                <li key={p.slug}>
                  <Link to={`/alternatives/${p.slug}`} className="text-muted-foreground hover:text-primary transition-colors">
                    vs {p.competitorName}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/compare" className="text-primary font-medium hover:underline">
                  See all comparisons →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-foreground">Guides & Resources</h3>
            <ul className="space-y-1.5">
              {popularBlogs.map((b) => (
                <li key={b.slug}>
                  <Link to={`/blog/${b.slug}`} className="text-muted-foreground hover:text-primary transition-colors line-clamp-1">
                    {b.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/blog" className="text-primary font-medium hover:underline">
                  All articles →
                </Link>
              </li>
              <li>
                <Link to="/waiver-templates" className="text-muted-foreground hover:text-primary transition-colors">
                  Waiver templates
                </Link>
              </li>
              <li>
                <Link to="/pricing-info" className="text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
