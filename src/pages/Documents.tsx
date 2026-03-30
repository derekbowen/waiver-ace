import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  Image,
  Trash2,
  Download,
  Filter,
  FolderOpen,
} from "lucide-react";

const FREE_QUOTA_BYTES = 100 * 1024 * 1024;

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileIcon(contentType: string) {
  if (contentType.startsWith("image/")) return Image;
  return FileText;
}

export default function Documents() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "waiver_pdf" | "user_upload">("all");
  const [uploading, setUploading] = useState(false);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents", filter],
    queryFn: async () => {
      let query = supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (filter !== "all") {
        query = query.eq("source", filter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const { data: wallet } = useQuery({
    queryKey: ["wallet-storage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallets")
        .select("credits, storage_used_bytes")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const storageUsed = wallet?.storage_used_bytes || 0;
  const storagePercent = Math.min(100, (storageUsed / FREE_QUOTA_BYTES) * 100);

  const deleteMutation = useMutation({
    mutationFn: async (doc: { id: string; storage_key: string }) => {
      const { error: storageErr } = await supabase.storage
        .from("org-documents")
        .remove([doc.storage_key]);
      if (storageErr) console.error("Storage delete error:", storageErr);

      const { error } = await supabase.from("documents").delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-storage"] });
      toast.success("Document deleted");
    },
    onError: () => toast.error("Failed to delete document"),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (file.size > 25 * 1024 * 1024) {
      toast.error("File exceeds 25MB limit");
      return;
    }

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Not authenticated");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/upload-document`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Upload failed");
        return;
      }

      toast.success("Document uploaded (1 credit used)");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-storage"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: { storage_key: string; filename: string }) => {
    const { data, error } = await supabase.storage
      .from("org-documents")
      .createSignedUrl(doc.storage_key, 60);
    if (error || !data?.signedUrl) {
      toast.error("Failed to generate download link");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold">Documents</h1>
            <p className="text-sm text-muted-foreground">
              Manage waiver PDFs and uploaded files
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label>
              <Input
                type="file"
                className="hidden"
                accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png,.webp"
                onChange={handleUpload}
                disabled={uploading}
              />
              <Button asChild disabled={uploading} size="sm">
                <span className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Uploading…" : "Upload (1 credit)"}
                </span>
              </Button>
            </label>
          </div>
        </div>

        {/* Storage usage */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Storage</span>
            <span className="text-sm text-muted-foreground">
              {formatBytes(storageUsed)} / {formatBytes(FREE_QUOTA_BYTES)}
            </span>
          </div>
          <Progress value={storagePercent} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {storagePercent < 90
              ? "Free tier — waiver PDFs stored at no extra charge"
              : "Approaching storage limit"}
          </p>
        </Card>

        {/* Filter tabs */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {(["all", "waiver_pdf", "user_upload"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f === "waiver_pdf" ? "Waivers" : "Uploads"}
            </Button>
          ))}
        </div>

        {/* Documents list */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : documents.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="font-medium">No documents yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Completed waivers will appear here automatically.
              You can also upload files manually.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {documents.map((doc: any) => {
              const Icon = getFileIcon(doc.content_type);
              return (
                <Card
                  key={doc.id}
                  className="flex items-center gap-3 p-3"
                >
                  <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.filename}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatBytes(doc.file_size)}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {doc.source === "waiver_pdf" ? "Waiver" : "Upload"}
                      </Badge>
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate({ id: doc.id, storage_key: doc.storage_key })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
