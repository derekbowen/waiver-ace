import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="container max-w-3xl flex-1 py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <h1 className="font-heading text-4xl font-bold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: March 9, 2026</p>

        <div className="prose prose-neutral max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Rental Waivers ("Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p>Rental Waivers provides an electronic waiver and e-signature platform for rental and marketplace businesses. The Service includes template creation, envelope management, e-signature collection, and API integrations.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">3. User Accounts</h2>
            <p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials and for all activity under your account.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">4. Acceptable Use</h2>
            <p>You agree not to misuse the Service, including but not limited to: sending fraudulent documents, attempting to bypass security measures, or using the Service for any unlawful purpose.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">5. E-Signatures &amp; Legal Validity</h2>
            <p>Rental Waivers facilitates electronic signatures in compliance with applicable e-signature laws. However, you are responsible for ensuring your use of electronic signatures meets the legal requirements of your jurisdiction.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">6. Credit-Based Billing</h2>
            <p>Rental Waivers operates on a prepaid credit model. Credits are purchased in packages and deducted when waivers are sent. Key terms:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Prepaid credits are non-refundable.</strong> Once purchased, credits cannot be refunded or exchanged for cash.</li>
              <li><strong>Credits never expire.</strong> Purchased credits remain in your organization's wallet indefinitely.</li>
              <li><strong>Variable credit pricing.</strong> Base cost is 1 credit per waiver. Premium features add +1 credit each: branded waivers (custom logo/colors), photo capture, and safety video requirements. Maximum cost is 4 credits per waiver with all features enabled.</li>
              <li><strong>Overdraft buffer.</strong> Your account may go up to -10 credits before waiver sending is paused. Any negative balance must be resolved by purchasing additional credits.</li>
              <li><strong>Auto-recharge.</strong> If enabled, your saved payment method will be automatically charged when your credit balance drops below your configured threshold. You may disable auto-recharge at any time.</li>
              <li><strong>Credit deduction timing.</strong> Credits are deducted at the time of sending (envelope creation), not upon signing. For group waivers, 1 credit is deducted at envelope creation regardless of group size.</li>
              <li><strong>Starter credits.</strong> New organizations receive 5 complimentary credits upon creation. These are non-transferable.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">7. Marketplace Integration</h2>
            <p>Rental Waivers offers integration with third-party booking platforms (e.g., ShareTribe, Bubble.io) via webhooks. By enabling marketplace integration:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>You authorize Rental Waivers to receive customer booking data (name, email, booking details) from your connected marketplace via webhook payloads.</li>
              <li>You are responsible for ensuring you have the right to share customer data with Rental Waivers for the purpose of sending waivers.</li>
              <li>Waivers generated via marketplace integration will be auto-created using your configured template or a default liability waiver template.</li>
              <li>Rental Waivers is not responsible for the accuracy of data received from third-party platforms.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">8. Customer Portal</h2>
            <p>Rental Waivers provides a customer-facing portal (/my-waivers) where signers can look up their waiver status by email. This portal is accessible without authentication. By using the Service, you acknowledge that signer waiver statuses (but not waiver content or signatures) are accessible via email lookup through this portal.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">9. Auto-Generated Waivers</h2>
            <p>When using marketplace integration without a configured template, Rental Waivers may auto-generate a default liability waiver. You are responsible for reviewing and customizing this template to meet your specific legal requirements. Rental Waivers does not provide legal advice and makes no guarantee that auto-generated waivers are suitable for your jurisdiction or use case.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">10. Data Retention</h2>
            <p>Signed documents and audit trails are retained according to your organization's configured retention period. Credit transaction history is retained for accounting and audit purposes. You may request deletion of your data by contacting us.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">11. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, Rental Waivers shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">12. Changes to Terms</h2>
            <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">13. Contact</h2>
            <p>Questions about these Terms? Contact us at <a href="mailto:hello@rentalwaivers.com" className="text-primary underline">hello@rentalwaivers.com</a>.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
