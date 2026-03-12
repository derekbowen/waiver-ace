import { Link } from "react-router-dom";
import { seoLandingPages } from "@/lib/seo-landing-data";
import { competitorAltPages } from "@/lib/competitor-alt-data";

interface InternalLinksProps {
  /** Current page slug to exclude from links */
  currentSlug?: string;
  /** "landing" | "competitor" — which type of page we're on */
  pageType?: "landing" | "competitor";
}

export function InternalLinks({ currentSlug, pageType }: InternalLinksProps) {
  const popularLandings = seoLandingPages
    .filter((p) => p.slug !== currentSlug)
    .slice(0, 8);

  const competitors = competitorAltPages
    .filter((p) => p.slug !== currentSlug)
    .slice(0, 6);

  return (
    <section className="border-t py-12 bg-muted/20">
      <div className="container max-w-5xl">
        <h2 className="font-heading text-lg font-bold mb-6 text-center">
          Explore More
        </h2>

        <div className="grid md:grid-cols-3 gap-8 text-sm">
          {/* Waiver types */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Waiver Types</h3>
            <ul className="space-y-1.5">
              {popularLandings.map((p) => (
                <li key={p.slug}>
                  <Link
                    to={`/waivers/${p.slug}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/industries" className="text-primary font-medium hover:underline">
                  View all industries →
                </Link>
              </li>
            </ul>
          </div>

          {/* Competitor comparisons */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Compare Alternatives</h3>
            <ul className="space-y-1.5">
              {competitors.map((p) => (
                <li key={p.slug}>
                  <Link
                    to={`/compare/${p.slug}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
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

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Resources</h3>
            <ul className="space-y-1.5">
              <li>
                <Link to="/pricing-info" className="text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/rental-waiver-software" className="text-muted-foreground hover:text-primary transition-colors">
                  Rental Waiver Software
                </Link>
              </li>
              <li>
                <Link to="/waiver-templates" className="text-muted-foreground hover:text-primary transition-colors">
                  Waiver Templates
                </Link>
              </li>
              <li>
                <Link to="/waiver-laws" className="text-muted-foreground hover:text-primary transition-colors">
                  Waiver Laws by State
                </Link>
              </li>
              <li>
                <Link to="/docs" className="text-muted-foreground hover:text-primary transition-colors">
                  API Documentation
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Get Started Free →
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
