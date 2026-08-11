import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, History, Loader2, Eye, GitCompare } from "lucide-react";
import { toast } from "sonner";
import { diffLines, diffStats, collapseUnchanged } from "@/lib/text-diff";
import { TemplatePreviewDialog } from "@/components/TemplatePreviewDialog";

interface VersionRow {
  id: string;
  version: number;
  is_current: boolean;
  created_at: string;
  content: any;
  variables: string[] | null;
}

const bodyOf = (content: any): string =>
  typeof content === "string" ? content : content?.body || "";

export default function TemplateVersions() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [templateName, setTemplateName] = useState("");
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [compareId, setCompareId] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const load = async () => {
    if (!id || !profile?.org_id) return;
    setLoading(true);
    try {
      const { data: template, error: tErr } = await supabase
        .from("templates")
        .select("id, name")
        .eq("id", id)
        .eq("org_id", profile.org_id)
        .single();
      if (tErr) throw tErr;
      setTemplateName(template.name || "");

      const { data, error } = await supabase
        .from("template_versions")
        .select("id, version, is_current, created_at, content, variables")
        .eq("template_id", id)
        .order("version", { ascending: false });
      if (error) throw error;

      const rows = (data as VersionRow[]) || [];
      setVersions(rows);
      setSelectedId((prev) => (prev && rows.some((r) => r.id === prev) ? prev : rows[0]?.id ?? null));
      setCompareId((prev) => (prev && rows.some((r) => r.id === prev) ? prev : rows[1]?.id ?? null));
    } catch (err: any) {
      toast.error(err.message || "Unable to load version history");
      navigate("/templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, profile?.org_id]);

  const selected = versions.find((v) => v.id === selectedId) || null;
  const compare = versions.find((v) => v.id === compareId) || null;

  const rendered = useMemo(() => {
    if (!selected) return [];
    const lines = diffLines(bodyOf(compare?.content), bodyOf(selected.content));
    return collapseUnchanged(lines, 3);
  }, [selected, compare]);

  const stats = useMemo(() => {
    if (!selected) return { added: 0, removed: 0, unchanged: 0 };
    return diffStats(diffLines(bodyOf(compare?.content), bodyOf(selected.content)));
  }, [selected, compare]);

  const setActive = async () => {
    if (!selected || !id) return;
    setActivating(true);
    try {
      const { error: clearErr } = await supabase
        .from("template_versions")
        .update({ is_current: false })
        .eq("template_id", id)
        .neq("id", selected.id);
      if (clearErr) throw clearErr;

      const { error } = await supabase
        .from("template_versions")
        .update({ is_current: true })
        .eq("id", selected.id)
        .eq("template_id", id);
      if (error) throw error;

      toast.success(`Version ${selected.version} is now active`);
      await load();
    } catch (err: any) {
      toast.error(err.message || "Unable to set active version");
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/templates/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
              <History className="h-5 w-5 text-primary" /> Version History
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {templateName} — review what changed before making a version active.
            </p>
          </div>
        </div>

        {versions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No saved versions yet. <Link className="underline" to={`/templates/${id}`}>Edit the template</Link> to create one.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-[260px_1fr]">
            <Card className="h-fit">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Versions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {versions.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedId(v.id);
                      const idx = versions.findIndex((x) => x.id === v.id);
                      setCompareId(versions[idx + 1]?.id ?? null);
                    }}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selectedId === v.id ? "border-primary bg-accent/50" : "hover:bg-accent/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Version {v.version}</span>
                      {v.is_current && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] text-success">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(v.created_at).toLocaleString()}
                    </p>
                  </button>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex flex-wrap items-center gap-3">
                    <GitCompare className="h-4 w-4 text-primary" />
                    <span>
                      {compare ? `Version ${compare.version} → ` : "First version — "}
                      Version {selected?.version}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      <span className="text-success">+{stats.added}</span>{" "}
                      <span className="text-destructive">−{stats.removed}</span> lines
                    </span>
                    <div className="ml-auto flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => setPreviewOpen(true)}>
                        <Eye className="h-3.5 w-3.5" /> Preview
                      </Button>
                      <Button
                        size="sm"
                        className="gap-2"
                        disabled={!selected || selected.is_current || activating}
                        onClick={setActive}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {selected?.is_current ? "Active" : activating ? "Setting..." : "Set as active"}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[60vh] overflow-auto rounded-lg border bg-accent/10 font-mono text-xs">
                    {rendered.length === 0 && (
                      <p className="p-6 text-muted-foreground font-sans">No content in this version.</p>
                    )}
                    {rendered.map((row, idx) =>
                      row.op === "skip" ? (
                        <div key={idx} className="bg-muted/50 px-4 py-1 text-center text-[10px] text-muted-foreground">
                          … {row.count} unchanged line{row.count === 1 ? "" : "s"} …
                        </div>
                      ) : (
                        <div
                          key={idx}
                          className={`flex gap-3 px-4 py-0.5 whitespace-pre-wrap break-words ${
                            row.op === "add"
                              ? "bg-success/10 text-success-foreground"
                              : row.op === "remove"
                                ? "bg-destructive/10 text-destructive"
                                : ""
                          }`}
                        >
                          <span className="w-4 shrink-0 select-none text-muted-foreground">
                            {row.op === "add" ? "+" : row.op === "remove" ? "−" : " "}
                          </span>
                          <span className="flex-1">{row.text || "\u00A0"}</span>
                        </div>
                      ),
                    )}
                  </div>
                  {stats.added === 0 && stats.removed === 0 && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      No text changes between these two versions.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <TemplatePreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          name={`${templateName} — v${selected?.version ?? ""}`}
          content={bodyOf(selected?.content)}
        />
      </div>
    </DashboardLayout>
  );
}
