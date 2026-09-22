// Guesty Open API client — used to hold a reservation until the waiver is
// signed, and to confirm + annotate it once the guest has signed.
//
// Credentials live per-organization on marketplace_integrations
// (client_id / client_secret / api_base_url), NOT in project secrets, so each
// host connects their own Guesty account.

const DEFAULT_BASE = "https://open-api.guesty.com/v1";
const TOKEN_URL = "https://open-api.guesty.com/oauth2/token";

export interface GuestyIntegration {
  client_id?: string | null;
  client_secret?: string | null;
  api_base_url?: string | null;
  platform?: string | null;
}

// Guesty access tokens last 24h; cache per client_id in module memory.
const tokenCache = new Map<string, { token: string; expiresAt: number }>();

export function hasGuestyCredentials(i: GuestyIntegration | null | undefined): boolean {
  return !!(i && i.platform === "guesty" && i.client_id && i.client_secret);
}

async function getToken(integration: GuestyIntegration): Promise<string> {
  const clientId = integration.client_id!;
  const cached = tokenCache.get(clientId);
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "open-api",
      client_id: clientId,
      client_secret: integration.client_secret!,
    }),
  });

  if (!res.ok) {
    throw new Error(`Guesty auth failed (${res.status}): ${await res.text()}`);
  }

  const json = await res.json();
  const token = json.access_token as string;
  const ttl = Number(json.expires_in || 86400) * 1000;
  tokenCache.set(clientId, { token, expiresAt: Date.now() + ttl });
  return token;
}

async function guestyFetch(
  integration: GuestyIntegration,
  path: string,
  init: RequestInit = {}
): Promise<any> {
  const base = (integration.api_base_url || DEFAULT_BASE).replace(/\/+$/, "");
  const token = await getToken(integration);

  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Guesty ${init.method || "GET"} ${path} failed (${res.status}): ${text.slice(0, 300)}`);
  }
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

export async function getReservation(integration: GuestyIntegration, reservationId: string) {
  return await guestyFetch(integration, `/reservations/${reservationId}`);
}

async function updateReservation(
  integration: GuestyIntegration,
  reservationId: string,
  patch: Record<string, unknown>
) {
  return await guestyFetch(integration, `/reservations/${reservationId}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
}

async function addNote(
  integration: GuestyIntegration,
  reservationId: string,
  note: string
): Promise<boolean> {
  // Preferred: dedicated notes endpoint.
  try {
    await guestyFetch(integration, `/reservations/${reservationId}/notes`, {
      method: "POST",
      body: JSON.stringify({ text: note, content: note }),
    });
    return true;
  } catch (e) {
    console.warn("Guesty notes endpoint failed, falling back to reservation field:", (e as Error).message);
  }
  // Fallback: append to the reservation's note field.
  try {
    const current = await getReservation(integration, reservationId);
    const existing = String(current?.notes?.other || current?.note || "").trim();
    const merged = existing ? `${existing}\n${note}` : note;
    await updateReservation(integration, reservationId, { "notes.other": merged });
    return true;
  } catch (e) {
    console.error("Guesty note write failed:", (e as Error).message);
    return false;
  }
}

async function setTags(
  integration: GuestyIntegration,
  reservationId: string,
  add: string[],
  remove: string[] = []
): Promise<boolean> {
  try {
    const current = await getReservation(integration, reservationId);
    const existing: string[] = Array.isArray(current?.tags) ? current.tags : [];
    const next = Array.from(
      new Set([...existing.filter((t) => !remove.includes(t)), ...add])
    );
    await updateReservation(integration, reservationId, { tags: next });
    return true;
  } catch (e) {
    console.error("Guesty tag write failed:", (e as Error).message);
    return false;
  }
}

export const WAIVER_SIGNED_TAG = "Waiver signed";
export const WAIVER_PENDING_TAG = "Waiver pending";

/**
 * Hold the reservation as unconfirmed until the waiver is signed.
 * Guesty's "reserved" status means booked but not confirmed.
 */
export async function holdReservationForWaiver(
  integration: GuestyIntegration,
  reservationId: string,
  signingUrl: string
): Promise<{ held: boolean; error?: string }> {
  if (!hasGuestyCredentials(integration) || !reservationId) {
    return { held: false, error: "Guesty API credentials not configured" };
  }
  try {
    await updateReservation(integration, reservationId, { status: "reserved" });
    await setTags(integration, reservationId, [WAIVER_PENDING_TAG], [WAIVER_SIGNED_TAG]);
    await addNote(
      integration,
      reservationId,
      `Rental Waivers: confirmation on hold — liability waiver not signed yet. Signing link: ${signingUrl}`
    );
    return { held: true };
  } catch (e) {
    const error = (e as Error).message;
    console.error("Guesty hold failed:", error);
    return { held: false, error };
  }
}

/**
 * Waiver completed — confirm the reservation, tag it and record the signed date
 * plus a link to the signed PDF.
 */
export async function confirmReservationAfterSigning(
  integration: GuestyIntegration,
  reservationId: string,
  opts: { signedAt?: string; signerName?: string; pdfUrl?: string }
): Promise<{ confirmed: boolean; error?: string }> {
  if (!hasGuestyCredentials(integration) || !reservationId) {
    return { confirmed: false, error: "Guesty API credentials not configured" };
  }
  try {
    const signedAt = opts.signedAt
      ? new Date(opts.signedAt).toLocaleString("en-US", {
          year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
        })
      : new Date().toLocaleString("en-US");

    await updateReservation(integration, reservationId, { status: "confirmed" });
    await setTags(integration, reservationId, [WAIVER_SIGNED_TAG], [WAIVER_PENDING_TAG]);
    await addNote(
      integration,
      reservationId,
      [
        `Rental Waivers: liability waiver signed${opts.signerName ? ` by ${opts.signerName}` : ""} on ${signedAt}.`,
        opts.pdfUrl ? `Signed PDF (link expires in 7 days): ${opts.pdfUrl}` : "",
        "Reservation automatically confirmed.",
      ].filter(Boolean).join(" ")
    );
    return { confirmed: true };
  } catch (e) {
    const error = (e as Error).message;
    console.error("Guesty confirm failed:", error);
    return { confirmed: false, error };
  }
}
