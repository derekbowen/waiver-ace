// GTM / dataLayer conversion tracking events

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

function push(event: string, data?: Record<string, unknown>) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...data });
}

/** User signs up (email or OAuth) */
export function trackSignUp(method: string) {
  push("sign_up", { method });
}

/** User signs in */
export function trackSignIn(method: string) {
  push("sign_in", { method });
}

/** First waiver sent by a new user */
export function trackFirstWaiverSent() {
  push("first_waiver_sent");
}

/** Waiver sent (any) */
export function trackWaiverSent(envelopeId: string) {
  push("waiver_sent", { envelope_id: envelopeId });
}

/** Waiver signed by a signer */
export function trackWaiverSigned(envelopeId: string) {
  push("waiver_signed", { envelope_id: envelopeId });
}

/** Credit purchase initiated */
export function trackCreditPurchase(packageId: string, amount: number, credits: number) {
  push("credit_purchase", {
    package_id: packageId,
    value: amount,
    currency: "USD",
    credits,
  });
}

/** Template created */
export function trackTemplateCreated(templateId: string) {
  push("template_created", { template_id: templateId });
}

/** Page view (for SPA navigation) */
export function trackPageView(path: string, title: string) {
  push("virtual_page_view", { page_path: path, page_title: title });
}
