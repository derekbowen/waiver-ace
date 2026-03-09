import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Mail, Search, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Pagination } from "@/components/Pagination";

interface Envelope {
  id: string;
  signer_name: string | null;
  signer_email: string;
  status: string;
  booking_id: string | null;
  listing_id: string | null;
  created_at: string;
}

export default function Envelopes() {
  const { profile } = useAuth();
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const navigate = useNavigate();

  const fetchEnvelopes = useCallback(() => {
    if (!profile?.org_id) { setLoading(false); return; }
    supabase
      .from("envelopes")
      .select("id, signer_name, signer_email, status, booking_id, listing_id, created_at")
      .eq("org_id", profile.org_id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error) setEnvelopes((data as Envelope[]) || []);
        setLoading(false);
      });
  }, [profile?.org_id]);

  useEffect(() => {
    fetchEnvelopes();
  }, [fetchEnvelopes]);

  // Realtime: update list when envelopes change
  useEffect(() => {
    if (!profile?.org_id) return;
    const channel = supabase
      .channel("envelopes-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "envelopes", filter: `org_id=eq.${profile.org_id}` },
        () => fetchEnvelopes()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile?.org_id, fetchEnvelopes]);

  const filtered = envelopes.filter((e) => {
    const matchSearch = !search || 
      e.signer_email.toLowerCase().includes(search.toLowerCase()) ||
      e.signer_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.booking_id?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const paginatedFiltered = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl font-bold">Envelopes</h1>
            <p className="text-sm text-muted-foreground mt-1">Track all waiver signatures</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/envelopes/bulk")} className="gap-2">
              <Plus className="h-4 w-4" /> Bulk Send
            </Button>
            <Button onClick={() => navigate("/envelopes/new")} className="gap-2">
              <Plus className="h-4 w-4" /> New Envelope
            </Button>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by email, name, booking ID..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="viewed">Viewed</SelectItem>
              <SelectItem value="signed">Signed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
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
              <Mail className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No envelopes found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {paginatedFiltered.map((e) => (
              <Link key={e.id} to={`/envelopes/${e.id}`}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{e.signer_name || e.signer_email}</p>
                        <p className="text-xs text-muted-foreground">
                          {e.booking_id && `Booking: ${e.booking_id} · `}
                          {format(new Date(e.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={e.status} />
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
