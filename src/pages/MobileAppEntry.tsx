import { useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNoindex } from "@/hooks/useNoindex";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

export const APP_MODE_KEY = "rw_app_mode";

/** Dedicated entry point for the iOS/Android apps. Never shows marketing content. */
export default function MobileAppEntry() {
  useNoindex();
  const { user, loading } = useAuth();

  useEffect(() => {
    try { localStorage.setItem(APP_MODE_KEY, "1"); } catch { /* ignore */ }
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background">
        <img src={logo} alt="Rental Waivers" className="h-16 w-16 rounded-2xl object-contain" />
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div
      className="flex min-h-screen flex-col bg-background px-6"
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 2rem)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)",
      }}
    >
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <img src={logo} alt="Rental Waivers" className="mb-6 h-20 w-20 rounded-2xl object-contain" />
        <h1 className="font-heading text-3xl font-bold tracking-tight">Rental Waivers</h1>
        <p className="mt-2 max-w-xs text-base text-muted-foreground">
          Collect signed waivers, check in guests and keep every record in one place.
        </p>
      </div>

      <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
        <Button asChild size="lg" className="h-12 text-base">
          <Link to="/login?next=/dashboard">Log In</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-12 text-base">
          <Link to="/login?mode=signup&next=/dashboard">Create Account</Link>
        </Button>
        <Button asChild variant="ghost" className="h-11 text-sm text-muted-foreground">
          <Link to="/forgot-password">Forgot Password?</Link>
        </Button>
        <div className="mt-2 flex justify-center gap-4 text-xs text-muted-foreground">
          <Link to="/privacy" className="py-3 underline">Privacy Policy</Link>
          <Link to="/terms" className="py-3 underline">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
