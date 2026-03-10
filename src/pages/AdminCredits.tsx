import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Coins, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface OrgResult {
  id: string;
  name: string;
  created_at: string;
  wallet_credits?: number;
  matched_email?: string;
  matched_name?: string;
}

export default function AdminCredits() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [orgs, setOrgs] = useState<OrgResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrgResult | null>(null);
  const [credits, setCredits] = useState(100);
  const [notes, setNotes] = useState("");
  const [adding, setAdding] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const term = search.trim();

      // Search orgs by name
      const { data: orgsByName } = await supabase
        .from("organizations")
        .select("id, name, created_at")
        .ilike("name", `%${term}%`)
        .limit(20);

      // Search profiles by email or name to find their org
      const { data: profileMatches } = await supabase
        .from("profiles")
        .select("org_id, email, full_name")
        .or(`email.ilike.%${term}%,full_name.ilike.%${term}%`)
        .not("org_id", "is", null)
        .limit(20);

      // Collect unique org IDs from profile matches
      const profileOrgIds = [...new Set(
        (profileMatches || []).map(p => p.org_id).filter(Boolean)
      )] as string[];

      // Fetch org details for profile-matched orgs not already found
      const existingOrgIds = new Set((orgsByName || []).map(o => o.id));
      const missingOrgIds = profileOrgIds.filter(id => !existingOrgIds.has(id));

      let extraOrgs: typeof orgsByName = [];
      if (missingOrgIds.length > 0) {
        const { data } = await supabase
          .from("organizations")
          .select("id, name, created_at")
          .in("id", missingOrgIds);
        extraOrgs = data || [];
      }

      const allOrgs = [...(orgsByName || []), ...extraOrgs];

      // Get wallet info for each org
      const orgsWithWallets: OrgResult[] = [];
      for (const org of allOrgs) {
        const { data: wallet } = await supabase
          .from("wallets")
          .select("credits")
          .eq("org_id", org.id)
          .single();
        // Find matching profile info for display
        const matchedProfile = (profileMatches || []).find(p => p.org_id === org.id);
        orgsWithWallets.push({
          ...org,
          wallet_credits: wallet?.credits ?? 0,
          matched_email: matchedProfile?.email ?? undefined,
          matched_name: matchedProfile?.full_name ?? undefined,
        });
      }
      setOrgs(orgsWithWallets);
    } catch (err: any) {
      toast.error("Search failed: " + err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleAddCredits = async () => {
    if (!selectedOrg || credits <= 0) return;
    setAdding(true);
    try {
      const { data, error } = await supabase.rpc("add_credits", {
        p_org_id: selectedOrg.id,
        p_amount: credits,
        p_reference_id: `admin_grant_${Date.now()}`,
        p_type: "admin_grant",
        p_notes: notes || `Manual credit grant by admin`,
      });

      if (error) throw error;

      toast.success(`Added ${credits} credits to ${selectedOrg.name}. New balance: ${data}`);
      setSelectedOrg({ ...selectedOrg, wallet_credits: data as number });
      setCredits(100);
      setNotes("");

      // Refresh org list
      handleSearch();
      loadRecentTransactions();
    } catch (err: any) {
      toast.error("Failed to add credits: " + err.message);
    } finally {
      setAdding(false);
    }
  };

  const loadRecentTransactions = async () => {
    const { data } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("type", "admin_grant")
      .order("created_at", { ascending: false })
      .limit(20);
    setRecentTransactions(data || []);
  };

  useEffect(() => {
    loadRecentTransactions();
  }, []);

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-4xl">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <Coins className="h-6 w-6 text-primary" />
            Credit Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Search organizations and add credits to their accounts
          </p>
        </div>

        <div className="space-y-6">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Search Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Search by organization name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={searching} className="gap-2">
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Search
                </Button>
              </div>

              {orgs.length > 0 && (
                <div className="mt-4 border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Organization</TableHead>
                        <TableHead className="text-right">Credits</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orgs.map((org) => (
                        <TableRow key={org.id} className={selectedOrg?.id === org.id ? "bg-primary/5" : ""}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{org.name}</div>
                                <div className="text-xs text-muted-foreground font-mono">{org.id.slice(0, 8)}...</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {org.wallet_credits?.toLocaleString() ?? 0}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant={selectedOrg?.id === org.id ? "default" : "outline"}
                              onClick={() => setSelectedOrg(org)}
                            >
                              Select
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Credits */}
          {selectedOrg && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Credits to {selectedOrg.name}
                </CardTitle>
                <CardDescription>
                  Current balance: {selectedOrg.wallet_credits?.toLocaleString() ?? 0} credits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Credits to Add</Label>
                    <Input
                      type="number"
                      min={1}
                      max={100000}
                      value={credits}
                      onChange={(e) => setCredits(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quick Add</Label>
                    <div className="flex gap-2">
                      {[100, 500, 1000, 5000].map((amt) => (
                        <Button
                          key={amt}
                          variant="outline"
                          size="sm"
                          onClick={() => setCredits(amt)}
                          className={credits === amt ? "border-primary" : ""}
                        >
                          {amt}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    placeholder="Reason for credit grant (e.g., promotional credits, support resolution)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>
                <Button onClick={handleAddCredits} disabled={adding || credits <= 0} className="gap-2">
                  {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add {credits.toLocaleString()} Credits
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Recent Admin Grants */}
          {recentTransactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Admin Grants</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Org ID</TableHead>
                      <TableHead className="text-right">Credits</TableHead>
                      <TableHead className="text-right">Balance After</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-sm">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {tx.org_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="text-right font-mono text-primary">
                          +{tx.credits_delta}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {tx.balance_after}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {tx.notes || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
