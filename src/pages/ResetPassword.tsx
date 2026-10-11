import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useNoindex } from "@/hooks/useNoindex";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound } from "lucide-react";
import logo from "@/assets/logo.png";
import { toast } from "sonner";

const ResetPassword = () => {
  useNoindex();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const isRecovery = window.location.hash.includes("type=recovery");
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (isRecovery && session)) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && isRecovery) setReady(true);
      setTimeout(() => setChecked(true), 1500);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (password !== confirm) return toast.error("Passwords don't match.");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated. You're signed in.");
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-8 text-center">
          <img src={logo} alt="Rental Waivers" className="mx-auto mb-4 h-14 w-14 rounded-xl object-contain" />
          <h1 className="font-heading text-2xl font-bold">Set a new password</h1>
        </div>

        {ready ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm new password</Label>
              <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} />
            </div>
            <Button type="submit" className="w-full gap-2 min-h-11" disabled={loading}>
              <KeyRound className="h-4 w-4" />
              {loading ? "Saving..." : "Save new password"}
            </Button>
          </form>
        ) : checked ? (
          <div className="rounded-md border bg-muted/40 p-4 text-center text-sm">
            This reset link is invalid or has expired.{" "}
            <Link to="/forgot-password" className="text-primary hover:underline">Request a new one</Link>.
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">Checking your reset link...</p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
