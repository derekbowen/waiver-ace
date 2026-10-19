import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { usePageMeta } from "@/lib/use-page-meta";

export default function Privacy() {
  usePageMeta(
    "Privacy Policy | Rental Waivers",
    "How Rental Waivers collects, uses, and protects your data — signer information, e-signature audit trails, payment records, and marketplace integration data.",
    "/privacy"
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="container max-w-3xl flex-1 py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <h1 className="font-heading text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: March 9, 2026</p>

        <div className="prose prose-neutral max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly, such as your name, email address, and organization details when you create an account. We also collect signer information (name, email, IP address, user agent) when documents are signed. Additional data we collect includes:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Wallet and credit data:</strong> Credit purchase history, transaction records, payment method identifiers (stored securely via Stripe), auto-recharge preferences, and credit balance information.</li>
              <li><strong>Marketplace integration data:</strong> When you connect a marketplace (e.g., ShareTribe), we receive customer information from booking webhooks including customer names, email addresses, booking IDs, listing details, and booking dates as transmitted by the marketplace platform.</li>
              <li><strong>Customer portal lookups:</strong> When customers use the /my-waivers portal, we process the email address they enter to look up their waiver status. We do not store portal access logs beyond standard server logs.</li>
              <li><strong>Signer photos (optional):</strong> If an operator enables photo verification, signers are asked to take a selfie during signing. Photos are captured only after the signer explicitly consents, are stored securely, and are used solely to verify the signer's identity for that waiver. We do not use photos for advertising, profiling, or biometric identification, and we never sell them.</li>
              <li><strong>Check-in passes:</strong> Signed waivers may generate a digital check-in pass that can be saved to Apple Wallet or Google Wallet. Saving a pass is optional and initiated by the signer.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
            <p>We use your information to provide and improve the Service, process e-signatures, maintain audit trails, send transactional emails, and comply with legal obligations.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">3. E-Signature Audit Data</h2>
            <p>When a signer completes a document, we record timestamps, IP addresses, and user agent strings to create a legally valid audit trail. This data is retained according to your organization's retention settings.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">4. Data Sharing</h2>
            <p>We do not sell your personal information. We may share data with:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Stripe:</strong> Payment processing for credit purchases and auto-recharge on our website. Stripe receives payment card details directly; we store only Stripe customer IDs and payment method identifiers. Purchases are not offered inside the iOS or Android apps.</li>
              <li><strong>Apple and Google:</strong> If you choose to save a check-in pass to Apple Wallet or Google Wallet, the pass details are delivered to your device through those services.</li>
              <li><strong>Resend:</strong> Email delivery service for sending waiver signing requests and notifications.</li>
              <li><strong>Connected marketplaces:</strong> If you use our marketplace integration, waiver status information may be returned to the marketplace via our status API when they query using their API key.</li>
              <li>As required by law or to protect our rights.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">5. Data Security</h2>
            <p>We implement industry-standard security measures including encryption in transit and at rest, access controls, and regular security reviews to protect your data.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">6. Cookies &amp; Analytics</h2>
            <p>We use essential cookies for authentication and session management. We may use analytics tools to understand usage patterns and improve the Service.</p>
            <p className="mt-3"><strong>Advertising measurement.</strong> When you arrive from one of our ads, our website uses the Google Ads tag (Google LLC) to measure whether you created an account. This shares an advertising cookie, your browser and device details, and the fact that a signup happened with Google, for ad measurement and to improve which ads are shown. In the EEA, UK, Switzerland and Canada we only do this if you accept in our cookie banner; elsewhere it is on by default. You can change or withdraw your choice anytime with "Cookie settings" in the site footer. Learn how Google uses data at <a href="https://business.safety.google/privacy/" target="_blank" rel="noopener noreferrer" className="underline">business.safety.google/privacy</a>.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">7. Data Retention for Credits</h2>
            <p>Credit transaction history (purchases, deductions, adjustments) is retained indefinitely for accounting, audit, and dispute resolution purposes. Wallet balances are maintained as long as your organization account is active.</p>
          </section>

          <section>
            <h2 id="delete-account" className="scroll-mt-24 font-heading text-lg font-semibold text-foreground mb-3">8. Your Rights &amp; Account Deletion</h2>
            <p>Depending on your jurisdiction, you may have the right to access, correct, delete, or export your personal data. Contact us to exercise these rights.</p>
            <p className="mt-3"><strong>Deleting your account.</strong> You can permanently delete your account and all associated data at any time from Settings &rarr; Danger Zone inside the app or on the website. Deletion is immediate and cannot be undone. You may also request deletion by emailing us.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">9. Children's Privacy</h2>
            <p>The Service is not intended for individuals under 18. We do not knowingly collect information from children.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically. We will notify you of material changes via email or through the Service.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">11. Contact</h2>
            <p>For privacy-related inquiries, contact us at <a href="mailto:hello@rentalwaivers.com" className="text-primary underline">hello@rentalwaivers.com</a>.</p>
            <p className="mt-2">Rental Waivers · Riverside, CA</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
