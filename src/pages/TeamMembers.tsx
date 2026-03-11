import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, UserPlus, Users, Mail } from "lucide-react";
import { toast } from "sonner";

export default function TeamMembers() {
  const { profile, user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("host");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.org_id) { setLoading(false); return; }

    Promise.all([
      supabase.from("profiles").select("id, full_name, email, user_id").eq("org_id", profile.org_id),
      supabase.from("team_invites").select("*").eq("org_id", profile.org_id).is("accepted_at", null),
    ]).then(([membersRes, invitesRes]) => {
      setMembers(membersRes.data || []);
      setInvites(invitesRes.data || []);
      setLoading(false);
    });
  }, [profile?.org_id]);

  const sendInvite = async () => {
    if (!profile?.org_id || !email.trim()) return;

    const { data, error } = await supabase
      .from("team_invites")
      .insert({
        org_id: profile.org_id,
        email: email.trim().toLowerCase(),
        role,
        invited_by: user!.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") toast.error("This email has already been invited");
      else toast.error(error.message);
      return;
    }

    // Send invite email
    supabase.functions.invoke("send-team-invite-email", {
      body: { email: email.trim().toLowerCase(), role, org_name: profile.org_id ? undefined : undefined },
    }).catch((e) => console.error("Invite email failed:", e));

    // Get org name for the email
    supabase.from("organizations").select("name").eq("id", profile.org_id).single().then(({ data: orgData }) => {
      supabase.functions.invoke("send-team-invite-email", {
        body: { email: email.trim().toLowerCase(), role, org_name: orgData?.name },
      }).catch((e) => console.error("Invite email failed:", e));
    });

    toast.success(`Invite sent to ${email}`);

    setInvites([data, ...invites]);
    setEmail("");
  };

  const revokeInvite = async (id: string) => {
    const { error } = await supabase.from("team_invites").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setInvites(invites.filter(i => i.id !== id));
    toast.success("Invite revoked");
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-2xl">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold">Team Members</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your team and invite new members</p>
        </div>

        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Invite Team Member</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="host">Host</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={sendInvite} disabled={!email.trim()} className="gap-2">
              <UserPlus className="h-4 w-4" /> Send Invite
            </Button>
          </CardContent>
        </Card>

        {invites.length > 0 && (
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-base">Pending Invites</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invites.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm">{inv.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Role: {inv.role} · Invited {new Date(inv.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => revokeInvite(inv.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="text-base">Current Members</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : members.length === 0 ? (
              <p className="text-sm text-muted-foreground">No team members</p>
            ) : (
              <div className="space-y-3">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{m.full_name || m.email || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{m.email}</p>
                      </div>
                    </div>
                    {m.user_id === user?.id && <Badge variant="secondary">You</Badge>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
