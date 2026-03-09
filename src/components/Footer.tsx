import React from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

export const Footer = React.forwardRef<HTMLElement>(function Footer(_, ref) {
  return (
    <footer className="border-t bg-card py-10">
      <div className="container">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Rental Waivers" className="h-7 w-7" />
            <span className="font-heading text-base font-bold tracking-tight">Rental Waivers</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <Link to="/docs" className="hover:text-foreground transition-colors">API Docs</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <a href="mailto:hello@rentalwaivers.com" className="hover:text-foreground transition-colors">
              hello@rentalwaivers.com
            </a>
            <span>Riverside, CA</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t text-xs text-muted-foreground space-y-2">
          <p>&copy; {new Date().getFullYear()} Rental Waivers. All rights reserved.</p>
          <p className="max-w-2xl">
            Rental Waivers is a document signing platform, not a law firm, and does not provide legal advice.
            Waiver templates are provided as starting points only and may not be legally enforceable in your jurisdiction.
            Consult a licensed attorney to ensure your documents meet applicable legal requirements.
          </p>
        </div>
      </div>
    </footer>
  );
});
