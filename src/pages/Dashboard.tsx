import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Mail, CheckCircle, Clock } from "lucide-react";

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ templates: 0, sent: 0, completed: 0, pending: 0 });

  useEffect(() => {
    if (!profile?.org_id) return;
    const fetchStats = async () => {
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
    };
    fetchStats();
  }, [profile?.org_id]);

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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((s) => (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-heading font-bold">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
