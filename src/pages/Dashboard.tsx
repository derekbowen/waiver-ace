import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/hooks/useWallet";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Mail, CheckCircle, Clock, Coins, AlertTriangle, MessageSquare, ReceiptText } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const { profile } = useAuth();
  const { credits, status, isPaused, isLow, isOverdraft, loading: walletLoading } = useWallet();
  const [stats, setStats] = useState({ templates: 0, sent: 0, completed: 0, pending: 0 });

  const fetchStats = useCallback(async () => {
    if (!profile?.org_id) return;
    const [templates, envelopes] = await Promise.all([
      supabase.from("templates").select("id", { count: "exact", head: true }).eq("org_id", profile.org_id!),
      supabase.from("envelopes").select("id, status").eq("org_id", profile.org_id!),
    ]);
    if (templates.error || envelopes.error) return;
    const envs = envelopes.data || [];
    setStats({
      templates: templates.count || 0,
      sent: envs.filter((e: any) => e.status === "sent").length,
      completed: envs.filter((e: any) => e.status === "completed" || e.status === "signed").length,
      pending: envs.filter((e: any) => ["sent", "viewed"].includes(e.status)).length,
    });
  }, [profile?.org_id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Realtime: re-fetch stats when any envelope changes
  useEffect(() => {
    if (!profile?.org_id) return;
    const channel = supabase
      .channel("dashboard-envelopes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "envelopes", filter: `org_id=eq.${profile.org_id}` },
        (payload) => {
          fetchStats();
          if (payload.eventType === "UPDATE" && (payload.new as any)?.status === "completed") {
            toast.success(`Waiver signed by ${(payload.new as any)?.signer_name || (payload.new as any)?.signer_email}`);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile?.org_id, fetchStats]);

  const statCards = [
    { label: "Templates", value: stats.templates, icon: FileText, color: "text-primary" },
    { label: "Sent", value: stats.sent, icon: Mail, color: "text-primary" },
    { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-success" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "text-warning" },
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {profile?.org_id ? "Overview of your waiver operations" : "Set up your organization to get started"}
          </p>
        </div>

        {!profile?.org_id && (
          <Card className="mb-8 border-warning/50 bg-warning/5">
            <CardContent className="pt-6">
              <p className="text-sm">
                <strong>Setup required:</strong> Go to{" "}
                <a href="/settings" className="text-primary underline">Settings</a>{" "}
                to create your organization before you can create templates and envelopes.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Credit balance warning */}
        {profile?.org_id && !walletLoading && (isPaused || isOverdraft || isLow) && (
          <Card className={`mb-6 ${isPaused ? "border-destructive/50 bg-destructive/5" : "border-warning/50 bg-warning/5"}`}>
            <CardContent className="pt-6 flex items-start gap-3">
              <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${isPaused ? "text-destructive" : "text-warning"}`} />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {isPaused ? "Waiver collection is paused" : isOverdraft ? "Credit balance in overdraft" : "Credit balance is low"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isPaused
                    ? "You've reached the overdraft limit. Add credits to resume sending waivers."
                    : `You have ${credits} credits remaining.`}{" "}
                  <Link to="/pricing" className="text-primary underline">Add credits</Link>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Credit balance card + stat cards */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-5 mb-6">
          {profile?.org_id && (
            <Card className={`col-span-2 lg:col-span-1 ${
              isPaused ? "border-destructive/30" : isLow || isOverdraft ? "border-warning/30" : "border-primary/20"
            }`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 md:p-6 md:pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Credits</CardTitle>
                <Coins className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                <div className="text-2xl md:text-3xl font-heading font-bold">{credits}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={status === "healthy" ? "default" : status === "paused" ? "destructive" : "secondary"} className="text-[10px]">
                    {status === "healthy" ? "Healthy" : status === "low" ? "Low" : status === "overdraft" ? "Overdraft" : "Paused"}
                  </Badge>
                  <Link to="/pricing" className="text-xs text-primary hover:underline">Add more</Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {statCards.map((s) => (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 md:p-6 md:pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </CardHeader>
              <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                <div className="text-2xl md:text-3xl font-heading font-bold">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help & Support section */}
        {profile?.org_id && (
          <Card className="mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button asChild variant="outline" size="sm">
                <a
                  href={`href={`sms:+19092728096?body=${encodeURIComponent(?body=${encodeURIComponent(
                    `Hi, I'm using Rental Waivers. My name is ${profile?.full_name || "a customer"} and I need some assistance today.`
                  )}`}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Text Us
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/credit-dispute">
                  <ReceiptText className="h-4 w-4 mr-2" />
                  Credit Dispute
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
