import React from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { FileText, Mail, MapPin, ExternalLink } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const waiverPages = [
  { label: "Pool Rental Waivers", slug: "pool-rental-waivers" },
  { label: "Boat Rental Waivers", slug: "boat-rental-waivers" },
  { label: "Jet Ski Waivers", slug: "jet-ski-rental-waivers" },
  { label: "Kayak Waivers", slug: "kayak-rental-waivers" },
  { label: "Airbnb Host Waivers", slug: "airbnb-host-waivers" },
  { label: "Vacation Rental Waivers", slug: "vacation-rental-waivers" },
  { label: "ATV Rental Waivers", slug: "atv-rental-waivers" },
  { label: "Bounce House Waivers", slug: "bounce-house-rental-waivers" },
  { label: "RV Rental Waivers", slug: "rv-rental-waivers" },
  { label: "Bike Rental Waivers", slug: "bike-rental-waivers" },
];

const moreWaiverPages = [
  { label: "Short-Term Rental Waivers", slug: "short-term-rental-waivers" },
  { label: "Property Manager Waivers", slug: "property-manager-waivers" },
  { label: "Golf Cart Waivers", slug: "golf-cart-rental-waivers" },
  { label: "Party Equipment Waivers", slug: "party-equipment-rental-waivers" },
  { label: "Paddleboard Waivers", slug: "paddleboard-rental-waivers" },
  { label: "Scooter Waivers", slug: "scooter-rental-waivers" },
  { label: "Equipment Rental Waivers", slug: "equipment-rental-waivers" },
  { label: "Event Rental Waivers", slug: "event-rental-waivers" },
  { label: "Hot Tub Waivers", slug: "hot-tub-rental-waivers" },
  { label: "Surfboard Waivers", slug: "surfboard-rental-waivers" },
];


export const Footer = React.forwardRef<HTMLElement>(function Footer(_, ref) {
  return (
    <footer ref={ref} className="border-t bg-card">
      {/* Main footer grid */}
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Rental Waivers" className="h-8 w-8" />
              <span className="font-heading text-lg font-bold tracking-tight">Rental Waivers</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              The lowest-cost digital waiver platform on the market. Pay per waiver, starting at 6¢. No monthly fees, no contracts.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <a className="flex items-center gap-2 hover:text-foreground transition-colors" href="mailto:hello@rentalwaivers.com">
                <Mail className="h-4 w-4 shrink-0" />
                <span>hello@rentalwaivers.com</span>
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" /> Riverside, CA
              </div>
            </div>
          </div>

          {/* Product column */}
          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-foreground">Product</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">Sign Up Free</Link></li>
              <li><Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">Sign In</Link></li>
              <li><Link to="/pricing-info" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link to="/docs" className="text-muted-foreground hover:text-foreground transition-colors">API Documentation</Link></li>
              <li><Link to="/my-waivers" className="text-muted-foreground hover:text-foreground transition-colors">Customer Portal</Link></li>
              <li><Link to="/contract-scanner-info" className="text-muted-foreground hover:text-foreground transition-colors">Contract Scanner</Link></li>
            </ul>
          </div>

          {/* Waiver types column */}
          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-foreground">Waiver Types</h3>
            <ul className="space-y-2.5 text-sm">
              {waiverPages.map((page) =>
              <li key={page.slug}>
                  <Link to={`/waivers/${page.slug}`} className="text-muted-foreground hover:text-foreground transition-colors">
                    {page.label}
                  </Link>
                </li>
              )}
              {moreWaiverPages.map((page) =>
              <li key={page.slug}>
                  <Link to={`/waivers/${page.slug}`} className="text-muted-foreground hover:text-foreground transition-colors">
                    {page.label}
                  </Link>
                </li>
              )}
              <li>
                <Link to="/industries" className="text-primary hover:text-primary/80 transition-colors font-medium">
                  View All Industries →
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Learn More column */}
          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-foreground">Resources</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/waiver-software" className="text-muted-foreground hover:text-foreground transition-colors">Waiver Software</Link></li>
              <li><Link to="/rental-waiver-software" className="text-muted-foreground hover:text-foreground transition-colors">Rental Waiver Software</Link></li>
              <li><Link to="/waiver-templates" className="text-muted-foreground hover:text-foreground transition-colors">Waiver Templates</Link></li>
              <li><Link to="/waiver-laws" className="text-muted-foreground hover:text-foreground transition-colors">Waiver Laws by State</Link></li>
              <li><Link to="/industries" className="text-muted-foreground hover:text-foreground transition-colors">Industries</Link></li>
              <li><Link to="/docs" className="text-muted-foreground hover:text-foreground transition-colors">API Reference</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
            </ul>

            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 mt-8 text-foreground">Compare</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/compare" className="text-muted-foreground hover:text-foreground transition-colors">Compare Waiver Software</Link></li>
              <li><Link to="/alternatives/smartwaiver-alternative" className="text-muted-foreground hover:text-foreground transition-colors">vs Smartwaiver</Link></li>
              <li><Link to="/alternatives/waiverforever-alternative" className="text-muted-foreground hover:text-foreground transition-colors">vs WaiverForever</Link></li>
              <li><Link to="/alternatives/waiverfile-alternative" className="text-muted-foreground hover:text-foreground transition-colors">vs WaiverFile</Link></li>
              <li><Link to="/alternatives/waiversign-alternative" className="text-muted-foreground hover:text-foreground transition-colors">vs WaiverSign</Link></li>
              <li><Link to="/alternatives/jotform-waiver-alternative" className="text-muted-foreground hover:text-foreground transition-colors">vs Jotform</Link></li>
              <li><Link to="/alternatives/docusign-waiver-alternative" className="text-muted-foreground hover:text-foreground transition-colors">vs DocuSign</Link></li>
              <li><Link to="/alternatives/pandadoc-waiver-alternative" className="text-muted-foreground hover:text-foreground transition-colors">vs PandaDoc</Link></li>
              <li><Link to="/alternatives/wherewolf-alternative" className="text-muted-foreground hover:text-foreground transition-colors">vs Wherewolf</Link></li>
            </ul>
          </div>

          {/* Legal & Company column */}
          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-foreground">Company</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li>
                <a href="https://10000solutions.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                  10,000 Solutions LLC <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>&copy; {new Date().getFullYear()} Rental Waivers — a product of <a href="https://10000solutions.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">10,000 Solutions LLC</a>. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <LanguageSwitcher variant="outline" />
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <a href="mailto:hello@rentalwaivers.com" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground/60 max-w-3xl leading-relaxed">
            Rental Waivers is a document signing platform, not a law firm, and does not provide legal advice.
            Waiver templates are provided as starting points only and may not be legally enforceable in your jurisdiction.
            Consult a licensed attorney to ensure your documents meet applicable legal requirements.
          </p>
        </div>
      </div>
    </footer>);

});