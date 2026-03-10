import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/hooks/useWallet";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  completed: "hsl(152, 60%, 40%)",
  sent: "hsl(220, 65%, 50%)",
  viewed: "hsl(38, 92%, 50%)",
  expired: "hsl(0, 72%, 51%)",
  canceled: "hsl(220, 10%, 46%)",
  draft: "hsl(220, 14%, 70%)",
};

export default function Analytics() {
  const { profile } = useAuth();
  const { credits, status } = useWallet();
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [envelopes, setEnvelopes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.org_id) { setLoading(false); return; }

    supabase
      .from("envelopes")
      .select("id, status, signer_email, signer_name, created_at, signed_at, booking_id")
      .eq("org_id", profile.org_id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) { setLoading(false); return; }
        const envs = data || [];
        setEnvelopes(envs);

        // Daily chart: last 30 days
        const days: Record<string, { sent: number; completed: number }> = {};
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          days[key] = { sent: 0, completed: 0 };
        }
        envs.forEach((e: any) => {
          const key = e.created_at.slice(0, 10);
          if (days[key]) days[key].sent++;
          if (e.signed_at) {
            const sKey = e.signed_at.slice(0, 10);
            if (days[sKey]) days[sKey].completed++;
          }
        });
        setDailyData(Object.entries(days).map(([date, v]) => ({
          date: date.slice(5), // MM-DD
          sent: v.sent,
          completed: v.completed,
        })));

        // Status breakdown
        const statusCounts: Record<string, number> = {};
        envs.forEach((e: any) => {
          statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
        });
        setStatusData(Object.entries(statusCounts).map(([status, count]) => ({
          name: status,
          value: count,
          fill: STATUS_COLORS[status] || "#999",
        })));

        setLoading(false);
      });
  }, [profile?.org_id]);

  const exportCsv = () => {
    if (envelopes.length === 0) return;
    const headers = ["id", "status", "signer_email", "signer_name", "booking_id", "created_at", "signed_at"];
    const rows = envelopes.map((e: any) => headers.map(h => `"${(e[h] ?? "").toString().replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "envelopes-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const completionRate = envelopes.length > 0
    ? Math.round((envelopes.filter((e: any) => e.status === "completed").length / envelopes.length) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl font-bold">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">Waiver performance and usage insights</p>
          </div>
          <Button variant="outline" onClick={exportCsv} disabled={envelopes.length === 0} className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Envelopes</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-heading font-bold">{envelopes.length}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-heading font-bold">{completionRate}%</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Credits</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-heading font-bold">{credits}<span className="text-lg text-muted-foreground ml-1 capitalize">{status}</span></div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-heading font-bold">{envelopes.filter((e: any) => ["sent", "viewed"].includes(e.status)).length}</div></CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <Card className="md:col-span-2">
                <CardHeader><CardTitle className="text-base">Waivers Over Time (30 days)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" fontSize={12} tickLine={false} className="fill-muted-foreground" />
                      <YAxis fontSize={12} tickLine={false} className="fill-muted-foreground" />
                      <Tooltip />
                      <Bar dataKey="sent" fill="hsl(220, 65%, 50%)" name="Sent" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="completed" fill="hsl(152, 60%, 40%)" name="Completed" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Status Breakdown</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {statusData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
