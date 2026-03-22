import { useState, useCallback, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Upload, Camera, Sparkles, Download, RotateCcw, Star, AlertCircle,
  CheckCircle, Clock, ImageIcon, ChevronRight, Loader2, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

type JobStatus = "pending" | "uploading" | "analyzing" | "analyzed" | "enhancing" | "completed" | "failed";

interface PhotoJob {
  id: string;
  status: JobStatus;
  original_storage_key: string | null;
  original_filename: string | null;
  analysis_json: any;
  processed_keys: string[];
  processing_time_ms: number | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
  originalPreviewUrl?: string;
  enhancedPreviewUrl?: string;
}

const ENHANCEMENT_OPTIONS = [
  { id: "replace_overcast_sky", label: "Sky Replacement", desc: "Replace gray/overcast sky with blue" },
  { id: "boost_saturation", label: "Boost Colors", desc: "Make image more vibrant" },
  { id: "enhance_water", label: "Pool Water", desc: "Crystal clear pool water" },
  { id: "improve_lighting", label: "Improve Lighting", desc: "Warm, inviting lighting" },
  { id: "remove_clutter", label: "Remove Clutter", desc: "Clean up distracting objects" },
];

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 8 ? "text-green-600" : score >= 5 ? "text-yellow-600" : "text-red-600";
  return (
    <div className="flex items-center gap-1.5">
      <Star className={cn("h-5 w-5 fill-current", color)} />
      <span className={cn("text-2xl font-bold", color)}>{score}</span>
      <span className="text-sm text-muted-foreground">/10</span>
    </div>
  );
}

function StatusBadgeLocal({ status }: { status: JobStatus }) {
  const map: Record<JobStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "Pending", variant: "secondary" },
    uploading: { label: "Uploading", variant: "secondary" },
    analyzing: { label: "Analyzing…", variant: "outline" },
    analyzed: { label: "Analyzed", variant: "default" },
    enhancing: { label: "Enhancing…", variant: "outline" },
    completed: { label: "Complete", variant: "default" },
    failed: { label: "Failed", variant: "destructive" },
  };
  const { label, variant } = map[status] || map.pending;
  return <Badge variant={variant}>{label}</Badge>;
}

export default function PhotoSell() {
  const { profile, wallet } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jobs, setJobs] = useState<PhotoJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<PhotoJob | null>(null);
  const [selectedEnhancements, setSelectedEnhancements] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);

  // Load jobs
  useEffect(() => {
    if (!profile?.org_id) return;
    const loadJobs = async () => {
      const { data } = await supabase
        .from("photo_jobs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) {
        const jobsWithUrls = await Promise.all(
          (data as any[]).map(async (job) => {
            let originalPreviewUrl: string | undefined;
            let enhancedPreviewUrl: string | undefined;
            if (job.original_storage_key) {
              const { data: url } = await supabase.storage
                .from("photo-uploads")
                .createSignedUrl(job.original_storage_key, 3600);
              originalPreviewUrl = url?.signedUrl;
            }
            if (job.processed_keys?.length > 0) {
              const { data: url } = await supabase.storage
                .from("photo-uploads")
                .createSignedUrl(job.processed_keys[0], 3600);
              enhancedPreviewUrl = url?.signedUrl;
            }
            return { ...job, originalPreviewUrl, enhancedPreviewUrl } as PhotoJob;
          })
        );
        setJobs(jobsWithUrls);
      }
    };
    loadJobs();
  }, [profile?.org_id]);

  const handleUpload = useCallback(async (file: File) => {
    if (!profile?.org_id) {
      toast({ title: "Error", description: "No organization found", variant: "destructive" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file", variant: "destructive" });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 50MB", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const jobId = crypto.randomUUID();
      const ext = file.name.split(".").pop() || "jpg";
      const storageKey = `${profile.org_id}/${jobId}/original.${ext}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("photo-uploads")
        .upload(storageKey, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      // Create job record
      const { error: insertError } = await supabase.from("photo_jobs").insert({
        id: jobId,
        org_id: profile.org_id,
        user_id: profile.id,
        status: "pending",
        original_storage_key: storageKey,
        original_filename: file.name,
        original_content_type: file.type,
      } as any);
      if (insertError) throw insertError;

      const previewUrl = URL.createObjectURL(file);
      const newJob: PhotoJob = {
        id: jobId,
        status: "pending",
        original_storage_key: storageKey,
        original_filename: file.name,
        analysis_json: null,
        processed_keys: [],
        processing_time_ms: null,
        error_message: null,
        created_at: new Date().toISOString(),
        completed_at: null,
        originalPreviewUrl: previewUrl,
      };
      setJobs(prev => [newJob, ...prev]);
      setSelectedJob(newJob);
      toast({ title: "Photo uploaded!", description: "Ready for analysis" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  }, [profile, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleAnalyze = useCallback(async () => {
    if (!selectedJob) return;
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-photo", {
        body: { job_id: selectedJob.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const updatedJob = {
        ...selectedJob,
        status: "analyzed" as JobStatus,
        analysis_json: data.analysis,
        processing_time_ms: data.processing_time_ms,
      };
      setSelectedJob(updatedJob);
      setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));

      // Auto-select recommended enhancements
      if (data.analysis?.enhancements_recommended) {
        setSelectedEnhancements(data.analysis.enhancements_recommended);
      }
      toast({ title: "Analysis complete!", description: `Score: ${data.analysis?.overall_score}/10` });
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedJob, toast]);

  const handleEnhance = useCallback(async () => {
    if (!selectedJob || selectedEnhancements.length === 0) return;
    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke("enhance-photo", {
        body: { job_id: selectedJob.id, enhancements: selectedEnhancements },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      let enhancedPreviewUrl: string | undefined;
      if (data.processed_keys?.length > 0) {
        const { data: url } = await supabase.storage
          .from("photo-uploads")
          .createSignedUrl(data.processed_keys[0], 3600);
        enhancedPreviewUrl = url?.signedUrl;
      }

      const updatedJob = {
        ...selectedJob,
        status: "completed" as JobStatus,
        processed_keys: data.processed_keys || [],
        enhancedPreviewUrl,
        completed_at: new Date().toISOString(),
      };
      setSelectedJob(updatedJob);
      setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
      toast({ title: "Enhancement complete!", description: "Your photo has been enhanced" });
    } catch (err: any) {
      toast({ title: "Enhancement failed", description: err.message, variant: "destructive" });
    } finally {
      setIsEnhancing(false);
    }
  }, [selectedJob, selectedEnhancements, toast]);

  const handleDownload = useCallback(async (storageKey: string, filename: string) => {
    const { data } = await supabase.storage.from("photo-uploads").createSignedUrl(storageKey, 300);
    if (data?.signedUrl) {
      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.download = filename;
      a.click();
    }
  }, []);

  const toggleEnhancement = (id: string) => {
    setSelectedEnhancements(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              PhotoSell
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered photo enhancement for your rental listings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <CreditCardIcon className="h-3 w-3" />
              {wallet.credits} credits
            </Badge>
            <span className="text-xs text-muted-foreground">5 credits per enhancement</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Main area */}
          <div className="space-y-4">
            {/* Upload zone */}
            {!selectedJob && (
              <Card
                className={cn(
                  "border-2 border-dashed transition-colors cursor-pointer",
                  dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                )}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  {isUploading ? (
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  ) : (
                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  )}
                  <h3 className="text-lg font-semibold mb-1">
                    {isUploading ? "Uploading…" : "Drop your photo here"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    JPG, PNG, HEIC up to 50MB
                  </p>
                  <Button variant="outline" disabled={isUploading}>
                    <Camera className="h-4 w-4 mr-2" />
                    Choose Photo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file);
                      e.target.value = "";
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Selected job viewer */}
            {selectedJob && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      {selectedJob.original_filename || "Photo"}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <StatusBadgeLocal status={selectedJob.status} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSelectedJob(null); setSelectedEnhancements([]); }}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        New
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Before / After comparison */}
                  {selectedJob.enhancedPreviewUrl && selectedJob.originalPreviewUrl ? (
                    <div className="relative overflow-hidden rounded-lg aspect-[4/3] bg-muted select-none">
                      {/* After (full) */}
                      <img
                        src={selectedJob.enhancedPreviewUrl}
                        alt="Enhanced"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {/* Before (clipped) */}
                      <div
                        className="absolute inset-0 overflow-hidden"
                        style={{ width: `${sliderPos}%` }}
                      >
                        <img
                          src={selectedJob.originalPreviewUrl}
                          alt="Original"
                          className="w-full h-full object-cover"
                          style={{ width: `${10000 / sliderPos}%`, maxWidth: "none" }}
                        />
                      </div>
                      {/* Slider */}
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={sliderPos}
                        onChange={(e) => setSliderPos(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-col-resize z-10"
                      />
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-[5] pointer-events-none"
                        style={{ left: `${sliderPos}%` }}
                      >
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                          <ChevronRight className="h-4 w-4 text-muted-foreground -rotate-180" />
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded z-[5]">Before</div>
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded z-[5]">After</div>
                    </div>
                  ) : selectedJob.originalPreviewUrl ? (
                    <div className="relative overflow-hidden rounded-lg aspect-[4/3] bg-muted">
                      <img
                        src={selectedJob.originalPreviewUrl}
                        alt="Original"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}

                  {/* Analysis results */}
                  {selectedJob.analysis_json && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">AI Analysis</h4>
                        <ScoreBadge score={selectedJob.analysis_json.overall_score} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedJob.analysis_json.summary}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg border p-2">
                          <span className="text-muted-foreground">Lighting</span>
                          <p className="font-medium capitalize">{selectedJob.analysis_json.lighting?.quality}</p>
                        </div>
                        <div className="rounded-lg border p-2">
                          <span className="text-muted-foreground">Sky</span>
                          <p className="font-medium capitalize">{selectedJob.analysis_json.lighting?.sky_condition?.replace("_", " ")}</p>
                        </div>
                        <div className="rounded-lg border p-2">
                          <span className="text-muted-foreground">Water</span>
                          <p className="font-medium capitalize">{selectedJob.analysis_json.water_quality?.color?.replace("_", " ")}</p>
                        </div>
                        <div className="rounded-lg border p-2">
                          <span className="text-muted-foreground">Clutter Items</span>
                          <p className="font-medium">{selectedJob.analysis_json.clutter?.detected_objects?.length || 0}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.status === "pending" && (
                      <Button onClick={handleAnalyze} disabled={isAnalyzing} className="gap-2">
                        {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        {isAnalyzing ? "Analyzing…" : "Analyze Photo"}
                      </Button>
                    )}
                    {selectedJob.status === "analyzed" && (
                      <Button onClick={handleEnhance} disabled={isEnhancing || selectedEnhancements.length === 0} className="gap-2">
                        {isEnhancing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        {isEnhancing ? "Enhancing…" : `Enhance (1 credit)`}
                      </Button>
                    )}
                    {selectedJob.status === "completed" && selectedJob.processed_keys?.[0] && (
                      <Button
                        variant="outline"
                        onClick={() => handleDownload(selectedJob.processed_keys[0], `enhanced-${selectedJob.original_filename}`)}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Enhanced
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhancement options (show when analyzed) */}
            {selectedJob?.status === "analyzed" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Enhancement Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {ENHANCEMENT_OPTIONS.map((opt) => {
                      const recommended = selectedJob.analysis_json?.enhancements_recommended?.includes(opt.id);
                      const selected = selectedEnhancements.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => toggleEnhancement(opt.id)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                            selected ? "border-primary bg-primary/5" : "border-muted hover:border-primary/30"
                          )}
                        >
                          <div className={cn(
                            "h-5 w-5 rounded border-2 flex items-center justify-center shrink-0",
                            selected ? "border-primary bg-primary" : "border-muted-foreground/30"
                          )}>
                            {selected && <CheckCircle className="h-3 w-3 text-primary-foreground" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium">{opt.label}</span>
                              {recommended && (
                                <Badge variant="secondary" className="text-[10px] px-1 py-0">AI Pick</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{opt.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar: Job history */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Recent Photos</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setSelectedJob(null); setSelectedEnhancements([]); }}
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Upload
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No photos yet. Upload your first one!
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {jobs.map((job) => (
                      <button
                        key={job.id}
                        onClick={() => { setSelectedJob(job); setSelectedEnhancements([]); }}
                        className={cn(
                          "w-full flex items-center gap-3 rounded-lg border p-2 text-left transition-colors",
                          selectedJob?.id === job.id ? "border-primary bg-primary/5" : "hover:bg-accent"
                        )}
                      >
                        <div className="h-12 w-12 rounded overflow-hidden bg-muted shrink-0">
                          {job.originalPreviewUrl ? (
                            <img src={job.originalPreviewUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-full w-full p-3 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{job.original_filename || "Photo"}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StatusBadgeLocal status={job.status} />
                            {job.analysis_json?.overall_score != null && (
                              <span className="text-xs text-muted-foreground">
                                Score: {job.analysis_json.overall_score}/10
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function CreditCardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
