import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="border-t bg-card py-10">
      <div className="container">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-heading text-base font-bold tracking-tight">Rental Waivers</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <a href="mailto:hello@rentalwaivers.com" className="hover:text-foreground transition-colors">
              hello@rentalwaivers.com
            </a>
            <span>Riverside, CA</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Rental Waivers. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
