export const LICENSE_MAX_BYTES = 5 * 1024 * 1024;
export function licenseImageType(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if ([137,80,78,71,13,10,26,10].every((b,i) => bytes[i] === b)) return "image/png";
  if (String.fromCharCode(...bytes.slice(0,4)) === "RIFF" && String.fromCharCode(...bytes.slice(8,12)) === "WEBP") return "image/webp";
  return null;
}
export function validLicenseUpload(size: number, consent: boolean): boolean {
  return consent && size > 0 && size <= LICENSE_MAX_BYTES;
}