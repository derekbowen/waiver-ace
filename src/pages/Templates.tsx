import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { QrCodeDialog } from "@/components/QrCodeDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, ChevronRight, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export default function Templates() {
  const { profile } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchTemplates = () => {
    if (!profile?.org_id) { setLoading(false); return; }
    supabase
      .from("templates")
      .select("*")
      .eq("org_id", profile.org_id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        setTemplates((data as Template[]) || []);
        setLoading(false);
      });
  };

  useEffect(() => { fetchTemplates(); }, [profile?.org_id]);

  const handleDuplicate = async (e: React.MouseEvent, t: Template) => {
    e.preventDefault();
    e.stopPropagation();
    if (!profile?.org_id) return;
    setDuplicating(t.id);
    try {
      // Get current version content
      const { data: version } = await supabase
        .from("template_versions")
        .select("content, variables")
        .eq("template_id", t.id)
        .eq("is_current", true)
        .single();

      // Create new template
      const { data: newTemplate, error: tErr } = await supabase
        .from("templates")
        .insert({
          org_id: profile.org_id,
          name: `${t.name} (Copy)`,
          description: t.description,
          is_active: true,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        } as any)
        .select()
        .single();
      if (tErr) throw tErr;

      // Create version
      if (version && newTemplate) {
        await supabase.from("template_versions").insert({
          template_id: (newTemplate as any).id,
          version: 1,
          content: version.content,
          variables: version.variables,
          is_current: true,
        });
      }

      toast.success("Template duplicated!");
      fetchTemplates();
    } catch (err: any) {
      toast.error(err.message || "Failed to duplicate");
    } finally {
      setDuplicating(null);
    }
  };

  // fetchTemplates already called via useEffect above

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl font-bold">Templates</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your waiver templates</p>
          </div>
          <div className="flex gap-2">
            <QrCodeDialog templates={templates} orgId={profile?.org_id || ""} />
            <Button onClick={() => navigate("/templates/new")} className="gap-2">
              <Plus className="h-4 w-4" /> New Template
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : templates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">No templates yet</p>
              <Button onClick={() => navigate("/templates/new")} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" /> Create your first template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {templates.map((t) => (
              <Link key={t.id} to={`/templates/${t.id}`}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.description || "No description"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Duplicate template"
                        disabled={duplicating === t.id}
                        onClick={(e) => handleDuplicate(e, t)}
                      >
                        {duplicating === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <span className={`text-xs px-2 py-1 rounded-full ${t.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                        {t.is_active ? "Active" : "Inactive"}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
