import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, AlertCircle, ImageUp, Loader2 } from "lucide-react";
import { openCameraStream, stopCameraStream, captureFrame } from "@/lib/camera";

interface PhotoCaptureProps {
  onPhoto: (blob: Blob | null) => void;
  required?: boolean;
}

/** Downscale an uploaded/phone-camera photo to a reasonable JPEG. */
async function normalizeImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const max = 1024;
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    return blob ?? file;
  } catch {
    return file;
  }
}

export function PhotoCapture({ onPhoto, required = false }: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewRef = useRef<string | null>(null);

  const [state, setState] = useState<"idle" | "starting" | "streaming" | "captured" | "error">("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const stopStream = useCallback(() => {
    stopCameraStream(streamRef.current);
    streamRef.current = null;
  }, []);

  // Cleanup only on unmount.
  useEffect(() => {
    return () => {
      stopCameraStream(streamRef.current);
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const setPreview = (blob: Blob | null) => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const url = blob ? URL.createObjectURL(blob) : null;
    previewRef.current = url;
    setPreviewUrl(url);
  };

  const startCamera = useCallback(async () => {
    setState("starting");
    try {
      const stream = await openCameraStream("user");
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("no video element");
      video.srcObject = stream;
      await video.play().catch(() => {});
      setState("streaming");
    } catch {
      stopStream();
      setErrorMessage("We couldn't open the camera in this browser. You can take or choose a photo instead.");
      setState("error");
    }
  }, [stopStream]);

  const capture = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;
    const blob = await captureFrame(video, canvas, 0.8);
    stopStream();
    if (!blob) return;
    setPreview(blob);
    onPhoto(blob);
    setState("captured");
  }, [stopStream, onPhoto]);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    stopStream();
    const blob = await normalizeImage(file);
    setPreview(blob);
    onPhoto(blob);
    setState("captured");
  };

  const retake = () => {
    setPreview(null);
    onPhoto(null);
    setState("idle");
  };

  const showVideo = state === "starting" || state === "streaming";

  return (
    <div className="space-y-2">
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={onFile}
      />

      {/* Video element is always mounted so the camera stream can attach to it. */}
      <div className={showVideo ? "space-y-2" : "hidden"}>
        <div className="relative rounded-lg overflow-hidden border bg-muted aspect-[4/3] flex items-center justify-center">
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline autoPlay />
          {state === "starting" && (
            <Loader2 className="absolute h-6 w-6 animate-spin text-muted-foreground" />
          )}
        </div>
        <Button onClick={capture} disabled={state !== "streaming"} className="w-full gap-2 min-h-11">
          <Camera className="h-4 w-4" /> Take Photo
        </Button>
        <Button variant="ghost" size="sm" className="w-full" onClick={() => fileRef.current?.click()}>
          Camera not showing? Use your phone camera instead
        </Button>
      </div>

      {state === "error" && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Camera unavailable</p>
              <p className="text-xs text-muted-foreground mt-1">{errorMessage}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" className="gap-1 min-h-11" onClick={() => fileRef.current?.click()}>
                  <ImageUp className="h-4 w-4" /> Take or choose photo
                </Button>
                <Button variant="outline" size="sm" className="min-h-11" onClick={startCamera}>
                  Try camera again
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {state === "idle" && (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-1">
            {required ? "A photo is required for identity verification" : "Take a photo for identity verification (optional)"}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Button variant="outline" size="sm" className="min-h-11" onClick={startCamera}>
              Open Camera
            </Button>
            <Button variant="ghost" size="sm" className="min-h-11 gap-1" onClick={() => fileRef.current?.click()}>
              <ImageUp className="h-4 w-4" /> Upload photo
            </Button>
          </div>
        </div>
      )}

      {state === "captured" && previewUrl && (
        <div className="space-y-2">
          <div className="rounded-lg overflow-hidden border aspect-[4/3]">
            <img src={previewUrl} alt="Captured photo" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">✓ Photo captured</span>
            <Button variant="outline" size="sm" onClick={retake} className="gap-1 min-h-11">
              <RotateCcw className="h-3 w-3" /> Retake
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
