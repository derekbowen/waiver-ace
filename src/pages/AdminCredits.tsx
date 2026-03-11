import { useState, useEffect, useRef, useCallback } from "react";
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
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setOrgs([]);
      setShowDropdown(false);
      return;
    }
    setSearching(true);
    try {
      const t = term.trim();

      // Search orgs by name + profiles by email/name in parallel
      const [orgsByNameRes, profileMatchesRes] = await Promise.all([
        supabase
          .from("organizations")
          .select("id, name, created_at")
          .ilike("name", `%${t}%`)
          .limit(20),
        supabase
          .from("profiles")
          .select("org_id, email, full_name")
          .or(`email.ilike.%${t}%,full_name.ilike.%${t}%`)
          .not("org_id", "is", null)
          .limit(20),
      ]);

      const orgsByName = orgsByNameRes.data || [];
      const profileMatches = profileMatchesRes.data || [];

      const existingOrgIds = new Set(orgsByName.map(o => o.id));
      const missingOrgIds = [...new Set(
        profileMatches.map(p => p.org_id).filter(Boolean)
      )].filter(id => !existingOrgIds.has(id!)) as string[];

      let extraOrgs: typeof orgsByName = [];
      if (missingOrgIds.length > 0) {
        const { data } = await supabase
          .from("organizations")
          .select("id, name, created_at")
          .in("id", missingOrgIds);
        extraOrgs = data || [];
      }

      const allOrgs = [...orgsByName, ...extraOrgs];

      // Get wallet info for all orgs in parallel
      const orgsWithWallets: OrgResult[] = await Promise.all(
        allOrgs.map(async (org) => {
          const { data: wallet } = await supabase
            .from("wallets")
            .select("credits")
            .eq("org_id", org.id)
            .maybeSingle();
          const matchedProfile = profileMatches.find(p => p.org_id === org.id);
          return {
            ...org,
            wallet_credits: wallet?.credits ?? 0,
            matched_email: matchedProfile?.email ?? undefined,
            matched_name: matchedProfile?.full_name ?? undefined,
          };
        })
      );

      setOrgs(orgsWithWallets);
      setShowDropdown(orgsWithWallets.length > 0);
    } catch (err: any) {
      toast.error("Search failed: " + err.message);
    } finally {
      setSearching(false);
    }
  }, []);

  const onSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(value), 300);
  };

  const selectOrg = (org: OrgResult) => {
    setSelectedOrg(org);
    setSearch(org.name);
    setShowDropdown(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Start typing org name, user email, or user name..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onFocus={() => orgs.length > 0 && setShowDropdown(true)}
                    className="pl-9"
                  />
                  {searching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>

                {showDropdown && orgs.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-72 overflow-y-auto">
                    {orgs.map((org) => (
                      <button
                        key={org.id}
                        onClick={() => selectOrg(org)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent text-left transition-colors border-b last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div>
                            <div className="font-medium text-sm">{org.name}</div>
                            {org.matched_email && (
                              <div className="text-xs text-muted-foreground">{org.matched_email}</div>
                            )}
                            {org.matched_name && !org.matched_email && (
                              <div className="text-xs text-muted-foreground">{org.matched_name}</div>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">
                          {org.wallet_credits?.toLocaleString() ?? 0} credits
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedOrg && (
                <div className="mt-3 flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{selectedOrg.name}</span>
                  <span className="text-xs text-muted-foreground font-mono ml-auto">
                    {selectedOrg.wallet_credits?.toLocaleString() ?? 0} credits
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      setSelectedOrg(null);
                      setSearch("");
                      setOrgs([]);
                    }}
                  >
                    Clear
                  </Button>
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
