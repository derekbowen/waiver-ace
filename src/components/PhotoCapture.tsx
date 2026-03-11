import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, AlertCircle } from "lucide-react";

interface PhotoCaptureProps {
  onPhoto: (blob: Blob | null) => void;
  required?: boolean;
}

export function PhotoCapture({ onPhoto, required = false }: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [state, setState] = useState<"idle" | "streaming" | "captured" | "error">("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      stopStream();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [stopStream, previewUrl]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setState("streaming");
    } catch {
      setErrorMessage("Camera access denied or unavailable. Please allow camera access and try again.");
      setState("error");
    }
  }, []);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    stopStream();

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(blob));
        onPhoto(blob);
        setState("captured");
      },
      "image/jpeg",
      0.8
    );
  }, [stopStream, onPhoto, previewUrl]);

  const retake = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onPhoto(null);
    startCamera();
  }, [previewUrl, onPhoto, startCamera]);

  if (state === "error") {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Camera Unavailable</p>
            <p className="text-xs text-muted-foreground mt-1">{errorMessage}</p>
            {!required && (
              <p className="text-xs text-muted-foreground mt-1">Photo is optional — you can continue without it.</p>
            )}
            <Button variant="outline" size="sm" className="mt-2" onClick={() => { setState("idle"); startCamera(); }}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (state === "idle") {
    return (
      <div className="space-y-2">
        <div className="rounded-lg border border-dashed p-6 text-center">
          <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-1">
            {required ? "A photo is required for identity verification" : "Take a photo for identity verification (optional)"}
          </p>
          <Button variant="outline" size="sm" onClick={startCamera} className="mt-2">
            Open Camera
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <canvas ref={canvasRef} className="hidden" />

      {state === "streaming" && (
        <div className="space-y-2">
          <div className="rounded-lg overflow-hidden border bg-black aspect-[4/3] flex items-center justify-center">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
          </div>
          <Button onClick={capture} className="w-full gap-2" size="sm">
            <Camera className="h-4 w-4" /> Take Photo
          </Button>
        </div>
      )}

      {state === "captured" && previewUrl && (
        <div className="space-y-2">
          <div className="rounded-lg overflow-hidden border aspect-[4/3]">
            <img src={previewUrl} alt="Captured photo" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">✓ Photo captured</span>
            <Button variant="outline" size="sm" onClick={retake} className="gap-1">
              <RotateCcw className="h-3 w-3" /> Retake
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
