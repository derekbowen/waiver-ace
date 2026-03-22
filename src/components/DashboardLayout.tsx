import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";
import {
  FileText,
  Mail,
  Settings,
  LayoutDashboard,
  LogOut,
  Key,
  Webhook,
  CreditCard,
  BarChart3,
  Users,
  Moon,
  Sun,
  MoreHorizontal,
  X,
  ChevronRight,
  Zap,
  HelpCircle,
  Sparkles } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

const navItems = [
{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
{ label: "Templates", href: "/templates", icon: FileText },
{ label: "Envelopes", href: "/envelopes", icon: Mail },
{ label: "Analytics", href: "/analytics", icon: BarChart3 },
{ label: "Team", href: "/settings/team", icon: Users },
{ label: "API Keys", href: "/settings/api-keys", icon: Key },
{ label: "Webhooks", href: "/settings/webhooks", icon: Webhook },
{ label: "Marketplace", href: "/settings/marketplace", icon: Zap },
{ label: "Pricing", href: "/pricing", icon: CreditCard },
{ label: "Help", href: "/docs", icon: HelpCircle },
{ label: "Settings", href: "/settings", icon: Settings }];


// Primary tabs shown in the bottom tab bar on mobile
const mobileTabItems = navItems.slice(0, 4); // Dashboard, Templates, Envelopes, Analytics
const mobileMoreItems = navItems.slice(4); // Team, API Keys, Webhooks, Pricing, Settings

export function DashboardLayout({ children }: {children: React.ReactNode;}) {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [moreOpen, setMoreOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const isMoreActive = mobileMoreItems.some(
    (item) => location.pathname === item.href || location.pathname.startsWith(item.href + "/")
  );

  // Find the current page title for the mobile header
  const currentPage = navItems.find(
    (item) => location.pathname === item.href || location.pathname.startsWith(item.href + "/")
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar — hidden on mobile */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden md:flex w-64 flex-col border-r bg-card">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <img src={logo} alt="Rental Waivers" className="h-8 w-8" />
          <span className="font-heading text-lg font-bold tracking-tight">RentalWaivers.com</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ?
                  "bg-primary text-primary-foreground" :
                  "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>);
          })}
        </nav>

        <div className="border-t p-4">
          <div className="mb-3 px-3">
            <p className="text-sm font-medium truncate">{profile?.full_name || profile?.email || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="flex-1 justify-start gap-2" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={toggle} title="Toggle dark mode">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </aside>

      {/* ── Mobile Header ── */}
      <header className="fixed top-0 inset-x-0 z-40 md:hidden h-12 flex items-center justify-between border-b bg-card px-4 gpu-fixed">
        <div className="flex items-center gap-2 min-w-0">
          <img src={logo} alt="Rental Waivers" className="h-6 w-6 shrink-0" />
          <span className="font-heading text-base font-bold tracking-tight truncate">
            {currentPage?.label || "Rental Waivers"}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggle}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="md:ml-64 flex-1 flex flex-col min-h-screen">
        <div className="flex-1 p-4 pt-16 pb-24 md:p-8 md:pt-8 md:pb-8">
          {children}
        </div>
        <div className="hidden md:block text-center py-4 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Rental Waivers &mdash; a product of 10,000 Solutions LLC
        </div>
      </main>

      {/* Mobile "More" sheet overlay */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-card pb-8 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>
            <div className="px-4 pb-2 flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold">More</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMoreOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="px-2">
              {mobileMoreItems.map((item) => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl mx-2 px-4 py-3 text-sm font-medium transition-colors",
                      isActive ? "bg-primary/10 text-primary" : "text-foreground active:bg-accent"
                    )}>
                    <item.icon className="h-5 w-5" />
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>);
              })}
            </nav>
            <div className="mx-4 mt-4 pt-4 border-t">
              <div className="px-2 mb-3">
                <p className="text-sm font-medium truncate">{profile?.full_name || profile?.email || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t bg-card gpu-fixed"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-stretch h-14">
          {mobileTabItems.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground active:text-foreground"
                )}>
                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "stroke-[2.5px]")} />
                <span className="leading-none">{item.label}</span>
              </Link>);
          })}

          {/* More tab */}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
              isMoreActive || moreOpen ? "text-primary" : "text-muted-foreground active:text-foreground"
            )}>
            <MoreHorizontal className={cn("h-5 w-5 shrink-0", (isMoreActive || moreOpen) && "stroke-[2.5px]")} />
            <span className="leading-none">More</span>
          </button>
        </div>
      </nav>
    </div>);

}