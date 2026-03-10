export const CREDIT_PACKAGES = [
  {
    id: "pkg_200",
    credits: 200,
    price: 20,
    perWaiver: "10¢",
    label: "Great for casual hosts",
  },
  {
    id: "pkg_550",
    credits: 550,
    price: 50,
    perWaiver: "9¢",
    label: "",
  },
  {
    id: "pkg_1250",
    credits: 1250,
    price: 100,
    perWaiver: "8¢",
    label: "The Sweet Spot",
    popular: true,
  },
  {
    id: "pkg_3500",
    credits: 3500,
    price: 250,
    perWaiver: "7¢",
    label: "",
  },
  {
    id: "pkg_8000",
    credits: 8000,
    price: 500,
    perWaiver: "6¢",
    label: "For power hosts",
  },
] as const;

export type PackageId = (typeof CREDIT_PACKAGES)[number]["id"];

export type CreditStatus = "healthy" | "low" | "overdraft" | "paused";

export function getCreditStatus(balance: number): CreditStatus {
  if (balance > 10) return "healthy";
  if (balance >= 1) return "low";
  if (balance > -10) return "overdraft";
  return "paused";
}

export function getPackageById(id: string) {
  return CREDIT_PACKAGES.find((p) => p.id === id);
}

export function getCreditsForPackage(id: string): number {
  return getPackageById(id)?.credits ?? 0;
}
