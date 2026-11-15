// Only approved, minimized driver fields are exported; never include license images.
export function driverVerificationLines(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  const d = value as Record<string, unknown>;
  const text = (key: string) => String(d[key] ?? "").replace(/[\r\n]/g, " ").slice(0, 120);
  return [
    "DRIVER VERIFICATION (SELF-REPORTED; STAFF APPROVAL REQUIRED)",
    `Driver: ${text("driver_name")}`,
    `Age: ${text("age")}`,
    `License issuing jurisdiction: ${text("licenseJurisdiction")}`,
    `License identifier (last four only): ${text("licenseLastFour").slice(-4)}`,
    `License expiration: ${text("licenseExpiration")}`,
    `Safety acknowledgment: ${d.safetyAcknowledged === true ? "Yes" : "No"}`,
    `Acknowledged at (UTC): ${text("safety_acknowledged_at")}`,
    "License inspection and driving approval: pending staff review",
  ];
}