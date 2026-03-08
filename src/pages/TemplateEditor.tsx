import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

const defaultVariables = [
  "customer_name", "booking_id", "listing_id", "date", "time",
  "host_name", "address_redacted", "rules", "state",
];

const defaultContent = `WAIVER AND RELEASE OF LIABILITY

This Waiver and Release of Liability ("Agreement") is entered into by and between the Host and the Customer identified below.

Customer: {{customer_name}}
Booking ID: {{booking_id}}
Date: {{date}}
Time: {{time}}
Location: {{address_redacted}}
State: {{state}}

ASSUMPTION OF RISK
The Customer acknowledges that the use of the pool and related facilities involves inherent risks, including but not limited to: drowning, slipping, diving injuries, and other physical harm. The Customer voluntarily assumes all such risks.

RELEASE AND WAIVER
The Customer hereby releases, waives, discharges, and covenants not to sue the Host ({{host_name}}), the property owner, and the platform from any and all liability, claims, demands, and causes of action arising out of or related to any loss, damage, or injury that may be sustained during the booking.

RULES AND REGULATIONS
{{rules}}

INDEMNIFICATION
The Customer agrees to indemnify and hold harmless the Host and platform from any claims arising from the Customer's use of the facilities.

By signing below, I acknowledge that I have read this waiver, understand its contents, and agree to its terms.`;

export default function TemplateEditor() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState(defaultContent);
  const [requireSigning, setRequireSigning] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!profile?.org_id) {
      toast.error("Please set up your organization first");
      return;
    }
    if (!name.trim()) {
      toast.error("Template name is required");
      return;
    }

    setSaving(true);
    try {
      // Create template
      const { data: template, error: tErr } = await supabase
        .from("templates")
        .insert({
          org_id: profile.org_id,
          name: name.trim(),
          description: description.trim() || null,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (tErr) throw tErr;

      // Create initial version
      const detectedVars = defaultVariables.filter((v) => content.includes(`{{${v}}}`));
      const { error: vErr } = await supabase
        .from("template_versions")
        .insert({
          template_id: template.id,
          version: 1,
          content: { body: content },
          variables: detectedVars,
          is_current: true,
        });

      if (vErr) throw vErr;

      toast.success("Template created");
      navigate("/templates");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/templates")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold">New Template</h1>
            <p className="text-sm text-muted-foreground mt-1">Create a reusable waiver template</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input placeholder="Pool Liability Waiver" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Standard waiver for pool bookings" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Template Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex flex-wrap gap-2">
                {defaultVariables.map((v) => (
                  <button
                    key={v}
                    onClick={() => setContent((c) => c + `{{${v}}}`)}
                    className="rounded-md border bg-accent px-2 py-1 text-xs font-mono text-muted-foreground hover:bg-accent/80 transition-colors"
                  >
                    {`{{${v}}}`}
                  </button>
                ))}
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate("/templates")}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Template"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
