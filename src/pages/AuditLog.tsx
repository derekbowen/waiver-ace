import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/Pagination";
import { ScrollText, Search, Monitor, Globe } from "lucide-react";
import { format } from "date-fns";

interface AuditEvent {
  id: string;
  envelope_id: string;
  event_type: string;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  // joined
  signer_name?: string | null;
  signer_email?: string;
}

const EVENT_TYPES = [
  { value: "all", label: "All events" },
  { value: "envelope.viewed", label: "Viewed" },
  { value: "envelope.completed", label: "Signed" },
  { value: "envelope.sent", label: "Sent" },
  { value: "envelope.reminder", label: "Reminder" },
  { value: "envelope.expired", label: "Expired" },
];

function eventBadgeVariant(type: string): "default" | "secondary" | "outline" | "destructive" {
  if (type.includes("completed") || type.includes("signed")) return "default";
  if (type.includes("viewed")) return "secondary";
  if (type.includes("expired") || type.includes("canceled")) return "destructive";
  return "outline";
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return "Unknown";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Linux")) return "Linux";
  return "Other";
}

export default function AuditLog() {
  const { profile } = useAuth();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const fetchEvents = useCallback(async () => {
    if (!profile?.org_id) { setLoading(false); return; }

    // Get envelope IDs for this org first
    const { data: envData } = await supabase
      .from("envelopes")
      .select("id, signer_name, signer_email")
      .eq("org_id", profile.org_id);

    if (!envData || envData.length === 0) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const envMap = new Map(envData.map((e) => [e.id, e]));
    const envIds = envData.map((e) => e.id);

    const { data: eventData, error } = await supabase
      .from("envelope_events")
      .select("*")
      .in("envelope_id", envIds)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      setLoading(false);
      return;
    }

    const merged = (eventData || []).map((ev: any) => {
      const env = envMap.get(ev.envelope_id);
      return {
        ...ev,
        signer_name: env?.signer_name,
        signer_email: env?.signer_email,
      };
    });

    setEvents(merged);
    setLoading(false);
  }, [profile?.org_id]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filtered = events.filter((e) => {
    const matchType = typeFilter === "all" || e.event_type === typeFilter;
    const matchSearch =
      !search ||
      e.signer_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.signer_email?.toLowerCase().includes(search.toLowerCase()) ||
      e.ip_address?.includes(search) ||
      e.event_type.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <ScrollText className="h-6 w-6 text-primary" />
            Audit Log
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete activity trail for all waivers in your organization
          </p>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, IP..."
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Event type" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ScrollText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No events found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {paginated.map((ev) => (
              <Card key={ev.id} className="hover:bg-accent/30 transition-colors">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge variant={eventBadgeVariant(ev.event_type)} className="text-xs capitalize shrink-0">
                        {ev.event_type.replace("envelope.", "")}
                      </Badge>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {ev.signer_name || ev.signer_email || "Unknown signer"}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span>{format(new Date(ev.created_at), "MMM d, yyyy h:mm a")}</span>
                          {ev.ip_address && (
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {ev.ip_address}
                            </span>
                          )}
                          {ev.user_agent && (
                            <span className="flex items-center gap-1">
                              <Monitor className="h-3 w-3" />
                              {parseUserAgent(ev.user_agent)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono shrink-0">
                      {ev.envelope_id.slice(0, 8)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
