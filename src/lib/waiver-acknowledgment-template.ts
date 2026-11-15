export const ACKNOWLEDGMENT_TEMPLATE_NAME = "Waiver Acknowledgment & Confirmation of Understanding";

export const acknowledgmentQuestions = [
  { variable: "acknowledged_waiver_title", label: "Exact title of the original waiver", placeholder: "Golf Cart Rental Agreement & Liability Waiver", type: "input" as const },
  { variable: "acknowledged_waiver_version", label: "Original waiver version or revision date", placeholder: "Version 1 — November 15, 2026", type: "input" as const },
  { variable: "acknowledged_waiver_reference", label: "Original waiver reference", placeholder: "Original waiver ID or booking reference for this guest", type: "input" as const },
];

export const acknowledgmentContent = `WAIVER ACKNOWLEDGMENT & CONFIRMATION OF UNDERSTANDING

Business: {{host_name}}
Business address: {{address_redacted}}
Participant: {{customer_name}}
Date: {{date}}
State: {{state}}

ORIGINAL WAIVER IDENTIFIED
Title: {{acknowledged_waiver_title}}
Version / revision date: {{acknowledged_waiver_version}}
Original waiver reference: {{acknowledged_waiver_reference}}

MY SEPARATE ACKNOWLEDGMENT
By signing this acknowledgment, I confirm that:

1. I received and read the complete original waiver identified above, including all of its terms, before signing it and this acknowledgment.
2. I understand that the original waiver is a legal document, not merely a check-in form, and may affect my legal rights, including my ability to bring certain claims, only to the extent permitted by applicable law.
3. I understand the risks described in the original waiver, the responsibilities I accepted, and the applicable safety rules, rental terms, and insurance disclosures, if any.
4. I had the opportunity to ask questions, request clarification or language assistance, and seek independent advice before signing. Any questions I had have been answered to my satisfaction. If I do not understand a term, I must not sign until it has been clarified.
5. I knowingly and voluntarily signed the original waiver and am knowingly and voluntarily signing this separate acknowledgment. I understand and agree to the original waiver's terms to the extent they are lawful and applicable to me.
6. I am signing for myself. This acknowledgment does not establish another adult's consent or authorize me to sign for another adult.

LIMITS OF THIS ACKNOWLEDGMENT
This is a separate record of my understanding and consent. It does not replace or expand the original waiver, cure an invalid waiver, waive rights that cannot legally be waived, create insurance coverage, or guarantee additional legal protection. If the original waiver changes, this acknowledgment does not confirm my acceptance of the changed terms.

ELECTRONIC SIGNATURE
I understand that my electronic signature records my agreement to this acknowledgment and will be retained with its signing timestamp. I may request a copy of this acknowledgment and the original waiver from the business.

ATTORNEY REVIEW REQUIRED: This editable starting-point template is not legal advice. Have a licensed attorney review the original waiver and this acknowledgment under applicable state law before use.`;