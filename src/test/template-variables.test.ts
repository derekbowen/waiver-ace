import { describe, it, expect } from "vitest";

// Replicate the template variable rendering logic from SigningPage.tsx
function renderTemplate(
  content: string,
  payload: Record<string, string | null | undefined>,
  signerName: string,
  date: string
): string {
  let rendered = content;
  Object.entries(payload).forEach(([key, value]) => {
    rendered = rendered.replace(
      new RegExp(`\\{\\{${key}\\}\\}`, "g"),
      String(value || "")
    );
  });
  rendered = rendered.replace(/\{\{customer_name\}\}/g, signerName || "");
  rendered = rendered.replace(/\{\{date\}\}/g, date);
  return rendered;
}

describe("Template variable rendering", () => {
  it("replaces payload variables", () => {
    const result = renderTemplate(
      "Booking: {{booking_id}} for {{listing_id}}",
      { booking_id: "bk_123", listing_id: "lst_456" },
      "",
      ""
    );
    expect(result).toBe("Booking: bk_123 for lst_456");
  });

  it("replaces customer_name with signer name", () => {
    const result = renderTemplate(
      "Customer: {{customer_name}}",
      {},
      "John Doe",
      ""
    );
    expect(result).toBe("Customer: John Doe");
  });

  it("replaces date variable", () => {
    const result = renderTemplate(
      "Date: {{date}}",
      {},
      "",
      "3/8/2026"
    );
    expect(result).toBe("Date: 3/8/2026");
  });

  it("handles null payload values as empty strings", () => {
    const result = renderTemplate(
      "Host: {{host_id}}",
      { host_id: null },
      "",
      ""
    );
    expect(result).toBe("Host: ");
  });

  it("replaces multiple occurrences of the same variable", () => {
    const result = renderTemplate(
      "{{customer_name}} agrees. Signed by {{customer_name}}.",
      {},
      "Jane",
      ""
    );
    expect(result).toBe("Jane agrees. Signed by Jane.");
  });

  it("leaves unmatched variables if not in payload or built-in", () => {
    const result = renderTemplate(
      "Rules: {{rules}}",
      {},
      "",
      ""
    );
    expect(result).toBe("Rules: {{rules}}");
  });
});
