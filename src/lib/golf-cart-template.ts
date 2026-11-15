export const GOLF_CART_TEMPLATE_NAME = "Golf Cart Rental Agreement & Liability Waiver";

export const golfCartQuestions = [
  { variable: "cart_model", label: "Golf cart model and power type", placeholder: "Model; gas-powered or electric", type: "input" as const },
  { variable: "vehicle_id", label: "Vehicle ID / VIN", placeholder: "Fleet ID or VIN", type: "input" as const },
  { variable: "rental_period", label: "Rental dates and return time", placeholder: "Start date/time and end date/time", type: "input" as const },
  { variable: "delivery_location", label: "Delivery location", placeholder: "Delivery address or collection point", type: "input" as const },
  { variable: "pickup_location", label: "Pickup / return location", placeholder: "Return address or collection point", type: "input" as const },
  { variable: "rental_terms", label: "Rental terms", placeholder: "Fees, deposit, fuel/charging, damage assessment, late return and cancellation terms", type: "textarea" as const },
  { variable: "insurance_terms", label: "Insurance responsibility and coverage", placeholder: "Who provides insurance; confirmed coverage, exclusions, deductibles and claims contact", type: "textarea" as const },
  { variable: "street_use_terms", label: "Vehicle classification and permitted routes", placeholder: "Ordinary golf cart or legally classified low-speed vehicle; permitted areas and verified street-use requirements", type: "textarea" as const },
  { variable: "state_legal_clauses", label: "State-specific clauses — attorney review required", placeholder: "Insert attorney-reviewed release, assumption-of-risk and applicable local requirements; do not invent statutory protections", type: "textarea" as const },
];

export const golfCartContent = `GOLF CART RENTAL AGREEMENT & LIABILITY WAIVER

RENTAL INFORMATION
Rental company: {{host_name}}
Customer / signing driver: {{customer_name}}
State: {{state}}
Business address: {{address_redacted}}
Rental dates and return time: {{rental_period}}
Golf cart model and power type: {{cart_model}}
Vehicle ID / VIN: {{vehicle_id}}
Delivery location: {{delivery_location}}
Pickup / return location: {{pickup_location}}
Rental terms: {{rental_terms}}

DRIVER VERIFICATION
Each driver must provide their own legal name, age, license issuing jurisdiction, license identifier (last four characters only), and license expiration date in the signing form. Staff must inspect the original license, confirm identity and driving eligibility, and approve each driver before releasing the vehicle. A signature alone does not verify a license or authorize driving. A license copy is optional and must only be collected by authorized staff through private account document storage with the driver's consent; never through the public selfie form.

RISK ACKNOWLEDGMENT
Gas-powered and electric golf carts may overturn, collide, lose traction, or expose occupants to falls, burns, battery or fuel hazards, serious injury, death, and damage to property. Roads, other vehicles, weather, terrain, and pedestrian traffic add risks. I understand these risks and voluntarily accept only those risks that may lawfully be assumed under applicable law.

SAFETY AGREEMENT — EACH DRIVER MUST SIGN SEPARATELY
I will use seat belts if equipped, obey posted speed limits and traffic rules, stay within approved routes, and never exceed the manufacturer's passenger or load limits. Passengers must remain seated. I will not drive impaired, distracted, or while using a handheld device; permit unauthorized drivers; or leave the vehicle unsecured. I will follow the company's fuel or charging instructions, report unsafe conditions, and stop use if the vehicle is unsafe. After an accident, I will seek emergency assistance when needed and promptly notify the rental company and authorities as required. Every additional driver must separately acknowledge these same rules and sign their own waiver; the renter cannot sign for another adult driver. Staff must confirm all intended drivers have signed and been approved.
Additional operating rules: {{rules}}

STREET USE AND VEHICLE CLASSIFICATION
{{street_use_terms}}
An ordinary golf cart is not automatically a legally classified low-speed vehicle. Street operation depends on the vehicle's legal classification and applicable state and local requirements, including equipment, registration, licensing, and insurance where required. Engine displacement alone does not determine licensing. No street operation is permitted unless staff confirms the vehicle and driver meet applicable requirements and the route is authorized. Calling a vehicle rental an "experience" does not avoid vehicle regulations or insurance requirements.

INSURANCE DISCLOSURE
{{insurance_terms}}
The rental company must clearly identify who is responsible for providing insurance and verify applicable coverage before release. This waiver is not insurance, does not substitute for legally required insurance, does not guarantee coverage, and does not eliminate all liability. Any allocation of damage costs remains subject to the rental terms and applicable law.

STATE-SPECIFIC RELEASE — ATTORNEY REVIEW REQUIRED BEFORE USE
{{state_legal_clauses}}
To the extent permitted by applicable state law and the attorney-reviewed clauses above, I release the rental company from claims arising from the risks expressly and lawfully released in this agreement. Nothing releases liability that cannot legally be waived, including gross negligence, reckless or intentional misconduct where protected by law, or nonwaivable statutory duties. No statutory protection or enforceability is guaranteed.

ELECTRONIC ACKNOWLEDGMENT
I have read this agreement, including the rental terms, insurance disclosure, and safety rules. I understand that each authorized driver must sign separately. I consent to electronic signing and retention of this waiver, my signature, and its timestamp in the existing Rental Waivers account.

ATTORNEY REVIEW REQUIRED: This editable starting-point template is not legal advice. Have counsel review the state-specific clauses, vehicle classification, street-use permissions, insurance disclosure, and rental terms before use.`;

export function isGolfCartContent(content: unknown): boolean {
  const body = typeof content === "string" ? content : (content as { body?: unknown } | null)?.body;
  return typeof body === "string" && body.includes("GOLF CART RENTAL AGREEMENT & LIABILITY WAIVER");
}

export interface DriverDetails {
  age: string;
  licenseJurisdiction: string;
  licenseLastFour: string;
  licenseExpiration: string;
  safetyAcknowledged: boolean;
}
export const emptyDriverDetails: DriverDetails = { age: "", licenseJurisdiction: "", licenseLastFour: "", licenseExpiration: "", safetyAcknowledged: false };

export function validateDriverDetails(driver: DriverDetails, today = new Date().toISOString().slice(0, 10)): string | null {
  if (!/^\d{1,3}$/.test(driver.age)) return "Enter your age in whole years.";
  if (!driver.licenseJurisdiction.trim()) return "Enter your license issuing state or country.";
  if (!/^[a-zA-Z0-9]{4}$/.test(driver.licenseLastFour)) return "Enter only the last four letters or digits of your license.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(driver.licenseExpiration) || Number.isNaN(Date.parse(driver.licenseExpiration)) || driver.licenseExpiration < today) return "Enter a current license expiration date.";
  if (!driver.safetyAcknowledged) return "Acknowledge the driver safety rules before signing.";
  return null;
}