/**
 * Single camera module for the whole app.
 *
 * Every camera access goes through here so the browser implementation
 * (getUserMedia) can be swapped for @capacitor/camera in the native app
 * without touching any page.
 *
 * Current callers:
 *  - src/components/PhotoCapture.tsx (signer selfie on SigningPage and GroupSigningPage)
 *
 * Not camera code (by design):
 *  - Staff check-in (/check-in) has no in-app scanner. Staff point the phone's
 *    own camera app at the guest's pass QR, which opens /check-in?code=… and
 *    verifies automatically. Manual code entry is the fallback.
 */
import { Capacitor } from "@capacitor/core";

export type CameraFacing = "user" | "environment";

export function isNativeCamera(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/** Open a live camera stream (browser). */
export async function openCameraStream(facing: CameraFacing = "user"): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Camera not supported on this device");
  }
  return navigator.mediaDevices.getUserMedia({
    video: { facingMode: facing, width: { ideal: 640 }, height: { ideal: 480 } },
  });
}

export function stopCameraStream(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((t) => t.stop());
}

/** Grab the current video frame as a JPEG blob. */
export function captureFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  quality = 0.85,
): Promise<Blob | null> {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);
  ctx.drawImage(video, 0, 0);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", quality));
}
