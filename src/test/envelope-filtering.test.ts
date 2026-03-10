import { describe, it, expect } from "vitest";

interface Envelope {
  id: string;
  signer_name: string | null;
  signer_email: string;
  status: string;
  booking_id: string | null;
  listing_id: string | null;
  created_at: string;
}

// Replicate the filter logic from Envelopes.tsx
function filterEnvelopes(
  envelopes: Envelope[],
  search: string,
  statusFilter: string
): Envelope[] {
  return envelopes.filter((e) => {
    const matchSearch =
      !search ||
      e.signer_email.toLowerCase().includes(search.toLowerCase()) ||
      e.signer_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.booking_id?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });
}

const mockEnvelopes: Envelope[] = [
  {
    id: "1",
    signer_name: "Alice Smith",
    signer_email: "alice@example.com",
    status: "completed",
    booking_id: "bk_100",
    listing_id: "lst_1",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "2",
    signer_name: null,
    signer_email: "bob@test.com",
    status: "sent",
    booking_id: null,
    listing_id: null,
    created_at: "2026-01-02T00:00:00Z",
  },
  {
    id: "3",
    signer_name: "Charlie Brown",
    signer_email: "charlie@example.com",
    status: "viewed",
    booking_id: "bk_200",
    listing_id: "lst_2",
    created_at: "2026-01-03T00:00:00Z",
  },
];

describe("Envelope filtering", () => {
  it("returns all envelopes with no filters", () => {
    expect(filterEnvelopes(mockEnvelopes, "", "all")).toHaveLength(3);
  });

  it("filters by status", () => {
    const result = filterEnvelopes(mockEnvelopes, "", "sent");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("filters by email search", () => {
    const result = filterEnvelopes(mockEnvelopes, "alice", "all");
    expect(result).toHaveLength(1);
    expect(result[0].signer_email).toBe("alice@example.com");
  });

  it("filters by signer name search", () => {
    const result = filterEnvelopes(mockEnvelopes, "charlie", "all");
    expect(result).toHaveLength(1);
  });

  it("filters by booking ID", () => {
    const result = filterEnvelopes(mockEnvelopes, "bk_200", "all");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("3");
  });

  it("combines search and status filter", () => {
    const result = filterEnvelopes(mockEnvelopes, "example.com", "completed");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("is case-insensitive", () => {
    const result = filterEnvelopes(mockEnvelopes, "ALICE", "all");
    expect(result).toHaveLength(1);
  });

  it("returns empty for no matches", () => {
    expect(filterEnvelopes(mockEnvelopes, "nonexistent", "all")).toHaveLength(0);
  });
});
