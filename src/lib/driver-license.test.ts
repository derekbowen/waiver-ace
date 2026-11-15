import { expect, it } from "vitest";
import { validLicenseUpload, licenseImageType, LICENSE_MAX_BYTES } from "../../supabase/functions/_shared/licenseValidation";
it("requires explicit consent for license capture", () => {
  expect(validLicenseUpload(100, false)).toBe(false);
  expect(validLicenseUpload(100, true)).toBe(true);
});
it("limits license images to 5 MB", () => {
  expect(LICENSE_MAX_BYTES).toBe(5 * 1024 * 1024);
  expect(validLicenseUpload(LICENSE_MAX_BYTES, true)).toBe(true);
  expect(validLicenseUpload(LICENSE_MAX_BYTES + 1, true)).toBe(false);
});
it("checks image signatures rather than trusting filenames", () => {
  expect(licenseImageType(new Uint8Array([137,80,78,71,13,10,26,10]))).toBe("image/png");
  expect(licenseImageType(new TextEncoder().encode("<script>bad</script>"))).toBeNull();
});