import { describe, expect, it } from "vitest";
import { emptyDriverDetails, validateDriverDetails } from "./golf-cart-template";
import { driverVerificationLines } from "../../supabase/functions/_shared/driverVerification";

const driver = { age: "32", licenseJurisdiction: "Florida", licenseLastFour: "A123", licenseExpiration: "2030-01-01", safetyAcknowledged: true };
describe("golf cart driver controls", () => {
  it("requires each driver's separate safety acknowledgment", () => {
    expect(validateDriverDetails(driver, "2026-11-15")).toBeNull();
    expect(validateDriverDetails({ ...driver, safetyAcknowledged: false }, "2026-11-15")).not.toBeNull();
  });
  it("only accepts minimized license identifiers", () => {
    expect(validateDriverDetails({ ...driver, licenseLastFour: "A12345678" }, "2026-11-15")).not.toBeNull();
    expect(validateDriverDetails({ ...driver, licenseLastFour: "A12" }, "2026-11-15")).not.toBeNull();
  });
  it("requires age, jurisdiction and a current expiration", () => {
    expect(validateDriverDetails(emptyDriverDetails, "2026-11-15")).not.toBeNull();
    expect(validateDriverDetails({ ...driver, licenseExpiration: "2026-11-14" }, "2026-11-15")).not.toBeNull();
    expect(validateDriverDetails({ ...driver, licenseJurisdiction: "" }, "2026-11-15")).not.toBeNull();
    expect(validateDriverDetails({ ...driver, age: "1.5" }, "2026-11-15")).not.toBeNull();
  });
  it("PDF export excludes arbitrary sensitive fields and retains driver evidence", () => {
    const lines = driverVerificationLines({ ...driver, driver_name: "QA Driver", licenseLastFour: "SECRET1234", license_image: "private-image", full_license: "full-secret" }).join("\n");
    expect(lines).toContain("1234");
    expect(lines).toContain("QA Driver");
    expect(lines).not.toContain("SECRET");
    expect(lines).not.toContain("private-image");
    expect(lines).not.toContain("full-secret");
  });
});