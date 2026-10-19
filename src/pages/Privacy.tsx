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
        <p className="text-sm text-muted-foreground mb-10">Last updated: October 18, 2026</p>

        <div className="prose prose-neutral max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly, such as your name, email address, and organization details when you create an account. We also collect signer information (name, initials, email, electronic signature, consent records, IP address, device/browser information, and timestamps) when documents are signed. Additional data we collect includes:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Minors and check-in records:</strong> Adults may provide minors’ names, ages, and guardian attestations. We process pass codes linked to signed waivers and record check-in activity.</li>
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
            <p>Credit transaction history (purchases, deductions, adjustments) is retained for accounting, audit, and dispute resolution while the organization exists. When the last member deletes the organization, the account-deletion process attempts to remove these records. Wallet balances are maintained as long as your organization account is active.</p>
          </section>

          <section id="delete-account">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Delete your Rental Waivers account and data</h2>
            <p>You can request deletion without installing the app. Email <a href="mailto:hello@rentalwaivers.com?subject=Delete%20my%20Rental%20Waivers%20account" className="text-primary underline">hello@rentalwaivers.com</a> from your account email with the subject “Delete my Rental Waivers account.” Include the account email and business name. We may verify your identity before processing your request; never send your password.</p>
            <p className="mt-3">You can also sign in on the website or in the app, open Settings → Danger Zone → Delete my account, type DELETE MY ACCOUNT, and confirm.</p>
            <p className="mt-3">Account deletion removes your login and profile. For the last member of an organization, the deletion process also attempts to remove the organization and its associated waiver, signature, audit, template, check-in, integration, credit transaction, and wallet records. Shared organization records remain available when other members remain. Unused credits are forfeited. Contact us to request confirmation of removal of uploaded photos and documents or to report any incomplete deletion.</p>
            <p className="mt-3">If you signed a waiver as a guest without creating an account, contact the rental business or email us with the email you used to sign and the business name to request deletion of your signer data. Waiver retention follows the organization’s retention settings; credit transaction retention is described above. We will explain any records that must be retained and the applicable retention period when responding to your request.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">9. Children's Privacy</h2>
            <p>Accounts are intended for adults. An adult signing a waiver on behalf of a minor may provide the minor’s name and age and attest that they are the parent, legal guardian, or authorized by one. Contact us or the rental business to request access to or deletion of this information.</p>
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
