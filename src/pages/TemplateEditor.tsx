import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Save, FileText, Droplets, Home, Wrench, PartyPopper, Ship, CarFront, Bike, Truck, Eye, ChevronRight, Shield } from "lucide-react";
import { toast } from "sonner";

const defaultVariables = [
  "customer_name", "booking_id", "listing_id", "date", "time",
  "host_name", "address_redacted", "rules", "state",
];

// Questions the wizard asks per category — these fill in template variables
interface WizardQuestion {
  variable: string;
  label: string;
  placeholder: string;
  type: "input" | "textarea" | "select";
  options?: string[]; // for select type
}

const COMMON_QUESTIONS: WizardQuestion[] = [
  { variable: "host_name", label: "Your business or host name", placeholder: "e.g. Sunset Pool Rentals", type: "input" },
  { variable: "state", label: "What state are you in?", placeholder: "e.g. Florida", type: "input" },
  { variable: "address_redacted", label: "Property or business address", placeholder: "e.g. 123 Main St, Miami, FL", type: "input" },
];

const CATEGORY_QUESTIONS: Record<string, WizardQuestion[]> = {
  pool: [
    ...COMMON_QUESTIONS,
    { variable: "rules", label: "Any pool rules you want included?", placeholder: "e.g. No diving, no glass containers, children under 12 must be accompanied by an adult, maximum 8 guests...", type: "textarea" },
  ],
  vacation_rental: [
    ...COMMON_QUESTIONS,
    { variable: "rules", label: "House rules for your rental?", placeholder: "e.g. No smoking, no parties, quiet hours after 10pm, maximum occupancy 8 guests...", type: "textarea" },
  ],
  equipment: [
    ...COMMON_QUESTIONS,
    { variable: "rules", label: "Rental terms or equipment rules?", placeholder: "e.g. Return by 6pm, no subletting, report damage immediately...", type: "textarea" },
  ],
  event_venue: [
    ...COMMON_QUESTIONS,
    { variable: "rules", label: "Venue rules?", placeholder: "e.g. No open flames, music off by 10pm, max 100 guests, no confetti...", type: "textarea" },
  ],
  boat_jetski: [
    ...COMMON_QUESTIONS,
    { variable: "rules", label: "Operating rules for the watercraft?", placeholder: "e.g. No wake zones must be observed, maximum 6 passengers, stay within marked area...", type: "textarea" },
  ],
  atv_offroad: [
    ...COMMON_QUESTIONS,
    { variable: "rules", label: "Safety rules and trail guidelines?", placeholder: "e.g. Stay on marked trails, max speed 25mph, helmets required at all times...", type: "textarea" },
  ],
  bounce_house: [
    ...COMMON_QUESTIONS,
    { variable: "rules", label: "Safety rules for the inflatables?", placeholder: "e.g. Max 6 kids at a time, remove shoes, no food inside, adult supervision required...", type: "textarea" },
  ],
  rv_camper: [
    ...COMMON_QUESTIONS,
    { variable: "rules", label: "Vehicle use rules?", placeholder: "e.g. No pets, no smoking inside, return with full tank, stay within 500 miles...", type: "textarea" },
  ],
  bike_scooter: [
    ...COMMON_QUESTIONS,
    { variable: "rules", label: "Rental rules?", placeholder: "e.g. Lock bike when unattended, no trick riding, return by 6pm, stay on paved paths...", type: "textarea" },
  ],
  prnm_pool_agreement: [
    ...COMMON_QUESTIONS,
    { variable: "rules", label: "Host rules & permissions (children allowed, smoking, pets, music, food, alcohol, grilling, glass containers, max swimmers, etc.)?", placeholder: "e.g. No glass containers, children allowed with supervision, no smoking, max 10 swimmers, no pets in pool area...", type: "textarea" },
  ],
};

interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  icon: any;
  content: string;
}

const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: "blank",
    name: "Blank Template",
    description: "Start from scratch with a custom waiver",
    icon: FileText,
    content: "",
  },
  {
    id: "pool",
    name: "Pool / Hot Tub",
    description: "Swimply, backyard pools, hot tubs",
    icon: Droplets,
    content: `WAIVER AND RELEASE OF LIABILITY — POOL / AQUATIC FACILITY USE

This Waiver and Release of Liability ("Agreement") is entered into by and between the Host and the Guest identified below.

Guest: {{customer_name}}
Booking ID: {{booking_id}}
Date of Use: {{date}}
Time: {{time}}
Property Location: {{address_redacted}}
State: {{state}}

ACKNOWLEDGMENT OF RISKS
The Guest acknowledges that use of the swimming pool, hot tub, deck area, and any related facilities involves inherent risks including but not limited to: drowning, near-drowning, slipping on wet surfaces, diving injuries, exposure to chemicals, sunburn, and other physical harm. These risks exist regardless of the care and precautions taken by the Host.

The Guest understands that:
- No lifeguard is on duty unless explicitly stated
- Children must be supervised by an adult at all times
- Pool depth may vary and diving may be prohibited
- Alcohol consumption increases the risk of injury

ASSUMPTION OF RISK
The Guest voluntarily assumes full responsibility for any risks of loss, property damage, or personal injury — including death — that may be sustained as a result of using the pool and related facilities.

RELEASE AND WAIVER
The Guest hereby releases, waives, discharges, and covenants not to sue the Host ({{host_name}}), the property owner, the booking platform, and their respective agents, employees, and affiliates from any and all liability, claims, demands, and causes of action arising out of or related to any loss, damage, or injury sustained during the booking period.

POOL RULES AND REGULATIONS
{{rules}}

INDEMNIFICATION
The Guest agrees to indemnify, defend, and hold harmless the Host, property owner, and booking platform from any claims, damages, losses, or expenses (including attorney fees) arising from the Guest's use of the facilities or violation of this Agreement.

MEDICAL ACKNOWLEDGMENT
The Guest confirms they have no medical conditions that would make pool use unsafe, or if such conditions exist, the Guest assumes all additional risk associated with their participation.

GOVERNING LAW
This Agreement shall be governed by the laws of the State of {{state}}.

DISCLAIMER: This waiver template is provided as a starting point only. Rental Waivers is not a law firm and does not provide legal advice. Consult a licensed attorney in your jurisdiction to ensure your waiver is legally enforceable.

By signing below, I acknowledge that I have read this waiver in its entirety, understand its contents, and voluntarily agree to its terms.`,
  },
  {
    id: "vacation_rental",
    name: "Vacation Rental",
    description: "Airbnb, VRBO, short-term rentals",
    icon: Home,
    content: `GUEST LIABILITY WAIVER AND HOLD HARMLESS AGREEMENT — VACATION RENTAL

This Liability Waiver and Hold Harmless Agreement ("Agreement") is entered into by and between the Property Host/Owner and the Guest identified below.

Guest: {{customer_name}}
Booking ID: {{booking_id}}
Check-in Date: {{date}}
Property Location: {{address_redacted}}
State: {{state}}

PROPERTY USE ACKNOWLEDGMENT
The Guest acknowledges that the rental property is a private residence being made available for short-term use. The Guest agrees to treat the property and its contents with reasonable care and to comply with all house rules, local ordinances, and HOA regulations.

ACKNOWLEDGMENT OF RISKS
The Guest understands and acknowledges that use of the rental property and its amenities (which may include but are not limited to: stairs, balconies, fire pits, grills, outdoor areas, and recreational equipment) carries inherent risks of injury or property damage.

The Guest acknowledges that:
- The property may not meet hotel-grade safety standards
- Outdoor areas may have uneven terrain or natural hazards
- Amenities are used at the Guest's own risk
- The Guest is responsible for the safety of all members of their party, including minors

ASSUMPTION OF RISK
The Guest voluntarily assumes all risks associated with the use of the property and its amenities, including risks arising from the condition of the property, the actions of other guests, wildlife, weather, or unforeseen events.

RELEASE AND WAIVER
The Guest hereby releases, waives, and discharges the Host ({{host_name}}), the property owner, the booking platform, and their respective agents and affiliates from any liability for personal injury, death, property damage, or theft occurring during the Guest's stay, except to the extent caused by the Host's gross negligence or willful misconduct.

PROPERTY DAMAGE
The Guest agrees to be financially responsible for any damage to the property or its contents caused by the Guest or any member of the Guest's party during the stay. The Guest authorizes the Host to charge any applicable damage deposit or payment method on file for repairs or replacement.

HOUSE RULES
{{rules}}

INDEMNIFICATION
The Guest agrees to indemnify and hold harmless the Host and property owner from any third-party claims arising from the Guest's use of the property.

GOVERNING LAW
This Agreement shall be governed by the laws of the State of {{state}}.

DISCLAIMER: This waiver template is provided as a starting point only. Rental Waivers is not a law firm and does not provide legal advice. Consult a licensed attorney in your jurisdiction to ensure your waiver is legally enforceable.

By signing below, I acknowledge that I have read this waiver in its entirety, understand its contents, and voluntarily agree to its terms.`,
  },
  {
    id: "equipment",
    name: "Equipment Rental",
    description: "Kayaks, tools, sports gear, cameras",
    icon: Wrench,
    content: `EQUIPMENT RENTAL WAIVER AND RELEASE OF LIABILITY

This Waiver and Release of Liability ("Agreement") is entered into by and between the Equipment Owner/Operator and the Renter identified below.

Renter: {{customer_name}}
Booking/Rental ID: {{booking_id}}
Rental Date: {{date}}
Pickup Time: {{time}}
Pickup Location: {{address_redacted}}
State: {{state}}

EQUIPMENT CONDITION
The Renter acknowledges that they have inspected the rented equipment and found it to be in satisfactory working condition. The Renter agrees to return the equipment in the same condition, allowing for reasonable wear and tear.

ACKNOWLEDGMENT OF RISKS
The Renter acknowledges that the use of rental equipment involves inherent risks, including but not limited to: physical injury, property damage, equipment malfunction, and accidents arising from use, transport, or environmental conditions. These risks may result in serious injury or death.

ASSUMPTION OF RISK
The Renter voluntarily assumes all risks associated with the use, transport, and storage of the rented equipment during the rental period, including risks that are not specifically identified in this Agreement.

PROPER USE
The Renter agrees to:
- Use the equipment only for its intended purpose
- Follow all safety instructions and guidelines provided
- Not allow unauthorized persons to use the equipment
- Not modify, disassemble, or alter the equipment in any way
- Immediately cease use if the equipment appears damaged or unsafe

RELEASE AND WAIVER
The Renter hereby releases, waives, and discharges the Equipment Owner ({{host_name}}), the booking platform, and their respective agents and affiliates from any and all liability, claims, and demands arising from the use of the rented equipment, including but not limited to personal injury, death, or property damage.

DAMAGE AND LOSS
The Renter accepts full financial responsibility for any damage to, loss of, or theft of the equipment during the rental period. The Renter agrees to pay for repair or replacement at current market value.

RENTAL TERMS AND CONDITIONS
{{rules}}

INDEMNIFICATION
The Renter agrees to indemnify and hold harmless the Equipment Owner from any third-party claims arising from the Renter's use of the equipment.

GOVERNING LAW
This Agreement shall be governed by the laws of the State of {{state}}.

DISCLAIMER: This waiver template is provided as a starting point only. Rental Waivers is not a law firm and does not provide legal advice. Consult a licensed attorney in your jurisdiction to ensure your waiver is legally enforceable.

By signing below, I acknowledge that I have read this waiver in its entirety, understand its contents, and voluntarily agree to its terms.`,
  },
  {
    id: "event_venue",
    name: "Event / Venue",
    description: "Party spaces, event halls, outdoor venues",
    icon: PartyPopper,
    content: `EVENT VENUE LIABILITY WAIVER AND RELEASE

This Liability Waiver and Release ("Agreement") is entered into by and between the Venue Host/Owner and the Event Organizer/Guest identified below.

Event Organizer: {{customer_name}}
Booking ID: {{booking_id}}
Event Date: {{date}}
Event Time: {{time}}
Venue Location: {{address_redacted}}
State: {{state}}

EVENT USE ACKNOWLEDGMENT
The Event Organizer acknowledges that they are renting the venue for a private event and accepts responsibility for the conduct of all attendees and vendors during the event period.

ACKNOWLEDGMENT OF RISKS
The Event Organizer acknowledges that use of the venue and its facilities involves inherent risks, including but not limited to: slips and falls, food-related illness, injuries from dancing or physical activities, alcohol-related incidents, injuries from event equipment or decorations, and damage to personal property.

ASSUMPTION OF RISK
The Event Organizer voluntarily assumes all risks associated with the use of the venue, including risks arising from the condition of the premises, the actions of event attendees, vendors, weather conditions, or unforeseen events.

RELEASE AND WAIVER
The Event Organizer hereby releases, waives, and discharges the Venue Host ({{host_name}}), property owner, booking platform, and their agents and affiliates from any liability for personal injury, death, or property damage occurring during the event, except in cases of gross negligence or willful misconduct by the Venue Host.

ATTENDEE RESPONSIBILITY
The Event Organizer agrees that:
- They are responsible for all event attendees and their behavior
- Minors must be supervised by a responsible adult at all times
- Any alcohol service must comply with applicable local and state laws
- The Event Organizer will ensure all attendees vacate the venue by the agreed-upon end time

PROPERTY DAMAGE
The Event Organizer accepts financial responsibility for any damage to the venue or its contents caused during the event. This includes damage caused by event attendees, vendors, or equipment.

VENUE RULES
{{rules}}

NOISE AND COMPLIANCE
The Event Organizer agrees to comply with all local noise ordinances and will ensure music and activities remain within permitted levels and hours.

INDEMNIFICATION
The Event Organizer agrees to indemnify, defend, and hold harmless the Venue Host from any and all claims, damages, or expenses arising from the event, including claims made by attendees, vendors, neighbors, or other third parties.

GOVERNING LAW
This Agreement shall be governed by the laws of the State of {{state}}.

DISCLAIMER: This waiver template is provided as a starting point only. Rental Waivers is not a law firm and does not provide legal advice. Consult a licensed attorney in your jurisdiction to ensure your waiver is legally enforceable.

By signing below, I acknowledge that I have read this waiver in its entirety, understand its contents, and voluntarily agree to its terms.`,
  },
  {
    id: "boat_jetski",
    name: "Boat / Jet Ski",
    description: "Watercraft, pontoons, jet skis",
    icon: Ship,
    content: `WATERCRAFT RENTAL WAIVER AND RELEASE OF LIABILITY

This Waiver and Release of Liability ("Agreement") is entered into by and between the Watercraft Owner/Operator and the Renter identified below.

Renter: {{customer_name}}
Booking/Rental ID: {{booking_id}}
Rental Date: {{date}}
Departure Time: {{time}}
Marina/Launch Location: {{address_redacted}}
State: {{state}}

WATERCRAFT CONDITION
The Renter acknowledges that they have inspected the watercraft and all provided safety equipment, found them to be in satisfactory condition, and received operating instructions from the Owner/Operator.

ACKNOWLEDGMENT OF RISKS
The Renter acknowledges that operating or riding on a watercraft involves significant inherent risks, including but not limited to: drowning, collision with other vessels or objects, capsizing, propeller injuries, hypothermia, sunburn, dehydration, mechanical failure, and injuries caused by waves, wake, weather, or other boaters. These risks may result in serious bodily injury or death.

The Renter acknowledges that:
- A valid boater safety certificate or license may be required by state law
- All passengers must wear a U.S. Coast Guard-approved personal flotation device (PFD) at all times while on the water
- Operating a watercraft under the influence of alcohol or drugs is illegal and strictly prohibited
- Weather and water conditions can change rapidly and without warning
- The Renter is solely responsible for safe operation of the watercraft

ASSUMPTION OF RISK
The Renter voluntarily assumes all risks associated with the operation, riding on, or proximity to the rented watercraft, including risks arising from the actions of other boaters, weather, water conditions, marine life, and equipment malfunction.

RELEASE AND WAIVER
The Renter hereby releases, waives, and discharges the Watercraft Owner/Operator ({{host_name}}), the marina, the booking platform, and their respective agents and affiliates from any and all liability, claims, and demands arising from the use of the watercraft, including personal injury, death, property damage, or loss.

OPERATING RULES
{{rules}}

DAMAGE AND LOSS
The Renter accepts full financial responsibility for any damage to, loss of, or theft of the watercraft and its equipment during the rental period. The Renter agrees to report any incidents, collisions, or mechanical issues immediately. The Renter authorizes charges to their payment method on file for repairs or replacement costs.

FUELING
The Renter agrees to return the watercraft with the same fuel level as at the time of rental, or pay the applicable refueling fee.

INDEMNIFICATION
The Renter agrees to indemnify and hold harmless the Watercraft Owner/Operator from any third-party claims, fines, or penalties arising from the Renter's operation of the watercraft.

GOVERNING LAW
This Agreement shall be governed by the laws of the State of {{state}} and applicable federal maritime regulations.

DISCLAIMER: This waiver template is provided as a starting point only. Rental Waivers is not a law firm and does not provide legal advice. Consult a licensed attorney in your jurisdiction to ensure your waiver is legally enforceable.

By signing below, I acknowledge that I have read this waiver in its entirety, understand its contents, and voluntarily agree to its terms.`,
  },
  {
    id: "atv_offroad",
    name: "ATV / Off-Road",
    description: "ATVs, UTVs, dirt bikes",
    icon: CarFront,
    content: `ATV / OFF-ROAD VEHICLE RENTAL WAIVER AND RELEASE OF LIABILITY

This Waiver and Release of Liability ("Agreement") is entered into by and between the Vehicle Owner/Operator and the Rider/Driver identified below.

Rider/Driver: {{customer_name}}
Booking/Rental ID: {{booking_id}}
Rental Date: {{date}}
Time: {{time}}
Location: {{address_redacted}}
State: {{state}}

VEHICLE CONDITION AND SAFETY BRIEFING
The Rider/Driver acknowledges that they have received a safety briefing, inspected the vehicle, and been fitted with appropriate safety gear (helmet, goggles, gloves as applicable). The Rider/Driver confirms they understand the vehicle's controls and operating procedures.

ACKNOWLEDGMENT OF RISKS
The Rider/Driver acknowledges that operating an ATV, UTV, or off-road vehicle is an inherently dangerous activity that involves significant risk of serious bodily injury or death. Risks include but are not limited to: rollovers, collisions with obstacles or other vehicles, falls, ejection from the vehicle, being struck by flying debris, exposure to rough terrain, mechanical failure, and injuries from dust, mud, or environmental conditions.

The Rider/Driver acknowledges that:
- ATVs and off-road vehicles can be unstable and tip over, especially on hills, turns, and uneven terrain
- Helmets are required and must be worn at all times while operating or riding
- Operating under the influence of alcohol or drugs is strictly prohibited
- Speed limits and designated trail boundaries must be followed
- Riders must meet minimum age and weight requirements
- Passengers are only permitted on vehicles designed for multiple riders

EXPERIENCE AND ABILITY
The Rider/Driver represents that they possess sufficient physical ability, skill, and experience to safely operate the assigned vehicle. The Rider/Driver acknowledges they have been given the opportunity to ask questions and decline participation.

ASSUMPTION OF RISK
The Rider/Driver voluntarily assumes all risks associated with the operation of the off-road vehicle, including risks that may arise from trail conditions, weather, mechanical issues, the actions of other riders, or the Rider/Driver's own inexperience.

RELEASE AND WAIVER
The Rider/Driver hereby releases, waives, and discharges the Vehicle Owner/Operator ({{host_name}}), the property owner, the booking platform, and their respective agents and affiliates from any and all liability for personal injury, death, or property damage arising from the use of the vehicle.

SAFETY RULES AND TRAIL GUIDELINES
{{rules}}

DAMAGE AND LOSS
The Rider/Driver accepts full financial responsibility for any damage to the vehicle caused by negligent operation, including rollovers, collisions, submerging the vehicle in water, or operating outside designated areas.

INDEMNIFICATION
The Rider/Driver agrees to indemnify and hold harmless the Vehicle Owner/Operator from any third-party claims arising from the Rider/Driver's operation of the vehicle.

GOVERNING LAW
This Agreement shall be governed by the laws of the State of {{state}}.

DISCLAIMER: This waiver template is provided as a starting point only. Rental Waivers is not a law firm and does not provide legal advice. Consult a licensed attorney in your jurisdiction to ensure your waiver is legally enforceable.

By signing below, I acknowledge that I have read this waiver in its entirety, understand its contents, and voluntarily agree to its terms.`,
  },
  {
    id: "bounce_house",
    name: "Bounce House",
    description: "Inflatables, water slides",
    icon: PartyPopper,
    content: `BOUNCE HOUSE / INFLATABLE EQUIPMENT RENTAL WAIVER AND RELEASE OF LIABILITY

This Waiver and Release of Liability ("Agreement") is entered into by and between the Rental Company and the Customer/Event Host identified below.

Customer/Event Host: {{customer_name}}
Booking/Rental ID: {{booking_id}}
Event Date: {{date}}
Setup Time: {{time}}
Event Location: {{address_redacted}}
State: {{state}}

EQUIPMENT USE ACKNOWLEDGMENT
The Customer acknowledges receipt of inflatable equipment in good working condition and agrees to supervise its use throughout the rental period. The Customer accepts responsibility for the safety of all users, including children.

ACKNOWLEDGMENT OF RISKS
The Customer acknowledges that the use of bounce houses, inflatable slides, and similar equipment involves inherent risks including but not limited to: falls, collisions between users, being thrown or ejected, neck and spinal injuries, broken bones, sprains, concussions, suffocation, and heat-related illness. These risks are present even with proper supervision.

The Customer acknowledges and agrees that:
- Adult supervision is required at ALL times when the equipment is in use
- Maximum occupancy limits must be strictly enforced
- Users must be separated by similar age and size groups
- No flips, wrestling, rough play, or piling on top of one another
- Shoes, glasses, jewelry, and sharp objects must be removed before entry
- No use during rain, high winds (15+ mph), thunderstorms, or wet conditions
- The equipment must remain properly anchored/staked at all times
- No food, drinks, silly string, or gum inside the inflatable
- The Customer must not move, re-anchor, or modify the equipment

ASSUMPTION OF RISK
The Customer voluntarily assumes all risks associated with the use of the inflatable equipment by themselves, their children, and all event attendees.

RELEASE AND WAIVER
The Customer hereby releases, waives, and discharges the Rental Company ({{host_name}}), its employees, agents, and affiliates from any and all liability for personal injury, death, or property damage arising from the use of the inflatable equipment.

SAFETY RULES
{{rules}}

WEATHER POLICY
The Customer agrees to immediately stop use and deflate or secure the equipment if wind speeds exceed 15 mph or if rain, lightning, or storms occur. The Rental Company is not responsible for injuries resulting from use during inclement weather.

DAMAGE
The Customer accepts financial responsibility for any damage to the equipment beyond normal wear, including punctures, tears, and stains. The Customer will be charged for repairs or replacement.

INDEMNIFICATION
The Customer agrees to indemnify and hold harmless the Rental Company from any claims made by event attendees or third parties arising from the use of the equipment.

GOVERNING LAW
This Agreement shall be governed by the laws of the State of {{state}}.

DISCLAIMER: This waiver template is provided as a starting point only. Rental Waivers is not a law firm and does not provide legal advice. Consult a licensed attorney in your jurisdiction to ensure your waiver is legally enforceable.

By signing below, I acknowledge that I have read this waiver in its entirety, understand its contents, and voluntarily agree to its terms.`,
  },
  {
    id: "rv_camper",
    name: "RV / Camper Van",
    description: "Motorhomes, camper vans, trailers",
    icon: Truck,
    content: `RV / CAMPER VAN RENTAL AGREEMENT AND WAIVER OF LIABILITY

This Rental Agreement and Waiver of Liability ("Agreement") is entered into by and between the RV Owner/Operator and the Renter identified below.

Renter: {{customer_name}}
Booking/Rental ID: {{booking_id}}
Pickup Date: {{date}}
Pickup Time: {{time}}
Pickup Location: {{address_redacted}}
State: {{state}}

VEHICLE CONDITION
The Renter acknowledges that they have inspected the RV/camper van, received a walkthrough of all systems (electrical, plumbing, propane, slide-outs, awning), and found the vehicle to be in satisfactory condition. The Renter has been given operating instructions and documentation.

DRIVER QUALIFICATIONS
The Renter certifies that:
- They possess a valid driver's license appropriate for the vehicle class
- They are at least 25 years of age (or the minimum age specified by the Owner)
- They have no DUI/DWI convictions in the past 5 years
- All listed drivers have been approved by the Owner
- Only approved drivers will operate the vehicle

ACKNOWLEDGMENT OF RISKS
The Renter acknowledges that operating a large recreational vehicle involves unique risks including but not limited to: rollovers, accidents due to vehicle size and weight, low-clearance bridge strikes, propane leaks, carbon monoxide exposure, generator hazards, tire blowouts, and injuries from improperly secured equipment during travel.

ASSUMPTION OF RISK
The Renter voluntarily assumes all risks associated with the operation, use, and occupancy of the rented RV/camper van.

RELEASE AND WAIVER
The Renter hereby releases, waives, and discharges the RV Owner/Operator ({{host_name}}), the booking platform, and their respective agents and affiliates from any liability for personal injury, death, or property damage arising from the Renter's use of the vehicle, except in cases of gross negligence by the Owner.

VEHICLE USE RULES
{{rules}}

PROHIBITED USES
The Renter agrees that the vehicle shall NOT be used for:
- Off-road driving or unpaved roads not suitable for RVs
- Towing (unless expressly permitted)
- Transport of hazardous materials
- Any illegal purposes
- Driving under the influence of alcohol or drugs
- Travel outside the agreed-upon geographic area
- Subletting or lending to unauthorized drivers

MILEAGE AND FUEL
The Renter agrees to return the vehicle with the same fuel level and propane level as at pickup, or pay applicable refueling charges. Mileage limits, if any, are specified in the booking confirmation.

DAMAGE AND INSURANCE
The Renter accepts financial responsibility for any damage to the vehicle during the rental period, including collision damage, interior damage, roof/awning damage, and tire damage. The Renter's personal auto insurance or any purchased supplemental coverage may apply — the Renter is responsible for verifying coverage.

INDEMNIFICATION
The Renter agrees to indemnify and hold harmless the RV Owner from any third-party claims, traffic violations, tolls, or fines incurred during the rental period.

GOVERNING LAW
This Agreement shall be governed by the laws of the State of {{state}}.

DISCLAIMER: This waiver template is provided as a starting point only. Rental Waivers is not a law firm and does not provide legal advice. Consult a licensed attorney in your jurisdiction to ensure your waiver is legally enforceable.

By signing below, I acknowledge that I have read this waiver in its entirety, understand its contents, and voluntarily agree to its terms.`,
  },
  {
    id: "bike_scooter",
    name: "Bike / Scooter",
    description: "Bicycles, e-bikes, scooters, mopeds",
    icon: Bike,
    content: `BICYCLE / SCOOTER RENTAL WAIVER AND RELEASE OF LIABILITY

This Waiver and Release of Liability ("Agreement") is entered into by and between the Rental Operator and the Rider identified below.

Rider: {{customer_name}}
Booking/Rental ID: {{booking_id}}
Rental Date: {{date}}
Pickup Time: {{time}}
Pickup Location: {{address_redacted}}
State: {{state}}

EQUIPMENT CONDITION
The Rider acknowledges that they have inspected the bicycle/scooter, tested the brakes and controls, confirmed proper tire inflation, verified the seat/handlebar adjustment, and found the equipment to be in safe, rideable condition. A helmet has been offered and the Rider has accepted or declined.

ACKNOWLEDGMENT OF RISKS
The Rider acknowledges that cycling and scooter riding on public roads, bike paths, and trails involves inherent and significant risks including but not limited to: collisions with motor vehicles, pedestrians, or other cyclists; falls due to road hazards, potholes, gravel, or wet surfaces; mechanical failure; injuries from traffic; theft of the equipment; and weather-related hazards.

The Rider acknowledges that:
- Helmets are strongly recommended (and may be required by local law)
- The Rider must obey all traffic laws, signals, and posted signs
- Riding under the influence of alcohol or drugs is prohibited
- E-bikes and electric scooters may reach speeds that increase injury risk
- The Rider is responsible for securing the bike/scooter with the provided lock when unattended
- Riding on sidewalks may be prohibited by local ordinance

EXPERIENCE AND ABILITY
The Rider represents that they know how to safely ride a bicycle/scooter, are physically capable of doing so, and are familiar with local traffic rules. For e-bikes and electric scooters, the Rider confirms they have received operating instructions and understand the throttle/pedal-assist controls.

ASSUMPTION OF RISK
The Rider voluntarily assumes all risks associated with riding the rented bicycle/scooter, including risks from road conditions, traffic, weather, equipment performance, and the Rider's own actions.

RELEASE AND WAIVER
The Rider hereby releases, waives, and discharges the Rental Operator ({{host_name}}), the booking platform, and their respective agents and affiliates from any and all liability for personal injury, death, or property damage arising from the use of the rented bicycle/scooter.

RENTAL RULES
{{rules}}

THEFT AND LOSS
The Rider accepts full financial responsibility for theft or loss of the bicycle/scooter during the rental period. The Rider must use the provided lock and take reasonable precautions. The Rider agrees to pay the full replacement value if the equipment is stolen or not returned.

DAMAGE
The Rider accepts financial responsibility for any damage to the bicycle/scooter beyond normal wear and tear, including bent wheels, damaged brakes, cosmetic damage, and electronic component failure (for e-bikes/scooters) caused by misuse.

LATE RETURNS
The Rider agrees to return the equipment by the agreed-upon time. Late returns will incur additional charges as specified in the rental terms.

INDEMNIFICATION
The Rider agrees to indemnify and hold harmless the Rental Operator from any third-party claims arising from the Rider's use of the equipment, including claims from pedestrians, motorists, or property owners.

GOVERNING LAW
This Agreement shall be governed by the laws of the State of {{state}}.

DISCLAIMER: This waiver template is provided as a starting point only. Rental Waivers is not a law firm and does not provide legal advice. Consult a licensed attorney in your jurisdiction to ensure your waiver is legally enforceable.

By signing below, I acknowledge that I have read this waiver in its entirety, understand its contents, and voluntarily agree to its terms.`,
  },
  {
    id: "prnm_pool_agreement",
    name: "PRNM Pool Use Agreement",
    description: "PoolRentalNearMe.com comprehensive pool waiver",
    icon: Shield,
    content: `PRIVATE POOL USE AGREEMENT & LIABILITY WAIVER

Provided free by PoolRentalNearMe.com | Digital version at RentalWaivers.com

This Agreement is entered into on the date indicated below between the Pool Owner/Host and the Guest/User for the temporary, private use of a residential swimming pool.

SECTION 1 — PARTY INFORMATION

POOL OWNER / HOST
Full Legal Name: {{host_name}}

GUEST / USER
Full Legal Name: {{customer_name}}
Booking ID: {{booking_id}}
Date of Use: {{date}}
Time of Use: {{time}}
Property Location: {{address_redacted}}
State: {{state}}

SECTION 2 — POOL USE DETAILS
Number of Guests in Party: ___
Agreed-Upon Fee: ___
Security Deposit Amount: ___

SECTION 3 — SCOPE OF USE
3.1. The Pool Owner grants the Guest a limited, temporary, non-exclusive, and revocable license to use the swimming pool and designated pool area at the property identified above, for the date and time specified above, subject to the terms and conditions of this Agreement.

3.2. The Guest acknowledges that the pool is a private residential pool and is NOT a public or commercial swimming facility. As such, it is not subject to public pool regulations, commercial safety codes, lifeguard requirements, or public health department water quality standards. The Guest accepts the pool in its current condition.

3.3. Use of the pool is limited to the Guest and the individuals identified in this Agreement. The Guest may not sublicense, transfer, or allow access to any person not listed herein without prior written consent of the Pool Owner.

3.4. Access is limited to the pool and designated pool area only. The Guest shall not enter, access, or use any other area of the property, including but not limited to the home, garage, sheds, or other structures, unless expressly authorized by the Pool Owner.

SECTION 4 — HOST RULES & PERMISSIONS
{{rules}}

SECTION 5 — ASSUMPTION OF RISK

PLEASE READ CAREFULLY. THIS SECTION AFFECTS YOUR LEGAL RIGHTS.

5.1. The Guest acknowledges that the use of a swimming pool and surrounding areas involves inherent risks, including but not limited to: drowning, near-drowning, spinal cord injuries, traumatic brain injuries, slip-and-fall injuries, sunburn, heat stroke, dehydration, skin irritation or allergic reactions to pool chemicals, cuts, abrasions, broken bones, muscle strains, electrocution, and other injuries or death.

5.2. The Guest voluntarily assumes all risks associated with the use of the pool, pool area, and any related facilities or equipment, whether known or unknown, foreseeable or unforeseeable, and whether caused by the negligence of the Pool Owner or otherwise.

5.3. The Guest acknowledges that no lifeguard is present and that supervision of all swimmers, including minors, is the sole responsibility of the Guest.

5.4. The Guest represents that all members of their party are able to swim or will be under the direct supervision of a competent adult swimmer at all times while in or near the pool.

SECTION 6 — WAIVER, RELEASE & HOLD HARMLESS

PLEASE READ CAREFULLY. BY SIGNING THIS AGREEMENT, YOU ARE GIVING UP CERTAIN LEGAL RIGHTS, INCLUDING THE RIGHT TO SUE.

6.1. RELEASE. The Guest, on behalf of themselves and their minor children, heirs, executors, administrators, successors, and assigns, hereby releases, waives, discharges, and covenants not to sue the Pool Owner, their family members, agents, representatives, insurers, and any affiliated platforms (including PoolRentalNearMe.com and RentalWaivers.com) (collectively, the "Released Parties") from any and all liability, claims, demands, actions, or causes of action arising out of or related to any loss, damage, injury, or death that may be sustained by the Guest or any member of the Guest's party while using the pool or pool area, whether caused by the negligence of the Released Parties or otherwise.

6.2. INDEMNIFICATION. The Guest agrees to indemnify, defend, and hold harmless the Released Parties from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorney's fees) arising from or related to the Guest's use of the pool, the Guest's breach of this Agreement, or any act or omission of the Guest or any member of the Guest's party.

6.3. PROPERTY DAMAGE. The Guest shall be financially responsible for any damage caused to the pool, pool area, equipment, furniture, or any other property of the Pool Owner by the Guest or any member of the Guest's party during the period of use. The Pool Owner may deduct the cost of repairs or replacement from the security deposit, if applicable.

SECTION 7 — GUEST OBLIGATIONS & CONDUCT

7.1. The Guest agrees to: Supervise all minors at all times. Children must be accompanied by a responsible adult in the water.
7.2. The Guest agrees to: Not engage in, or permit others to engage in, running, diving (unless expressly permitted), horseplay, roughhousing, or any other dangerous behavior in or around the pool area.
7.3. The Guest agrees to: Not introduce any glass, sharp objects, or hazardous materials into the pool or pool area.
7.4. The Guest agrees to: Not introduce any chemicals, soaps, detergents, or substances into the pool water.
7.5. The Guest agrees to: Leave the pool and pool area in the same condition as found upon arrival.
7.6. The Guest agrees to: Report any damage, incidents, injuries, or safety concerns to the Pool Owner immediately.
7.7. The Guest agrees to: Comply with all posted rules, the Host Rules in Section 4, and any verbal instructions from the Pool Owner.
7.8. The Guest agrees to: Not exceed the maximum occupancy established by the Pool Owner.
7.9. The Guest agrees to: Ensure all guests in the party are aware of and comply with the terms of this Agreement.
7.10. The Guest agrees to: Inform the Pool Owner of any known allergies to pool chemicals (chlorine, bromine, salt, etc.) prior to entering the pool.

SECTION 8 — HOST OBLIGATIONS

8.1. The Pool Owner agrees to provide access to the pool and designated pool area at the agreed-upon time and for the agreed-upon duration.
8.2. The Pool Owner agrees to maintain the pool in a reasonably clean and safe condition suitable for recreational use.
8.3. The Pool Owner agrees to disclose any known hazards, defects, or conditions of the pool or pool area that could affect the safety of the Guest.
8.4. The Pool Owner represents that they have the legal right and authority to grant temporary use of the pool and that such use does not violate any HOA rules, local ordinances, lease agreements, or other restrictions applicable to the property.

SECTION 9 — CANCELLATION & REFUNDS

9.1. The Pool Owner may cancel the reservation at any time for any reason. In the event of cancellation by the Pool Owner, the Guest shall receive a full refund of all fees paid.
9.2. The Guest may cancel the reservation with a full refund if cancellation is made more than 48 hours before the scheduled start time. Cancellations within 48 hours of the scheduled start time may be subject to the Pool Owner's cancellation policy.
9.3. If the Pool Owner fails to provide access to the pool within 30 minutes of the scheduled start time, the reservation shall be deemed cancelled by the Pool Owner, and the Guest shall be entitled to a full refund.

SECTION 10 — SECURITY DEPOSIT

10.1. The Pool Owner may require a security deposit as indicated in Section 2 to cover potential property damage during the period of use.
10.2. The security deposit shall be returned in full within 48 hours of the end of the reservation, provided no damage has occurred. Normal wear and tear shall not be grounds for withholding the deposit.
10.3. If damage exceeds the security deposit amount, the Guest agrees to be responsible for the full cost of repair or replacement.

SECTION 11 — PHOTO, VIDEO & PRIVACY

11.1. The Guest shall not photograph, video record, or otherwise capture images of the Pool Owner's property, home, or personal belongings beyond the pool area without express permission.
11.2. The Guest shall not post the exact address or identifiable images of the property on social media or any public platform without the Pool Owner's prior written consent.

SECTION 12 — MEDICAL & ALLERGY DISCLOSURE

12.1. The Guest represents that neither the Guest nor any member of their party has a medical condition that would make pool use inadvisable, unless disclosed below.

SECTION 13 — MINOR PARTICIPANTS

13.1. By signing this Agreement, the Guest represents that they are the parent or legal guardian of all minor children in their party, or have been authorized by the parent/legal guardian to sign on their behalf.
13.2. The Guest assumes full responsibility for the supervision and safety of all minors and agrees that all terms of this Agreement, including the assumption of risk and waiver of liability, apply equally to all minor participants.

SECTION 14 — GENERAL PROVISIONS

14.1. GOVERNING LAW. This Agreement shall be governed by the laws of the State of {{state}}.
14.2. SEVERABILITY. If any provision of this Agreement is found to be unenforceable or invalid, the remaining provisions shall remain in full force and effect.
14.3. ENTIRE AGREEMENT. This Agreement constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements relating to the subject matter herein.
14.4. MODIFICATION. This Agreement may not be modified except in writing signed by both parties.
14.5. PLATFORM DISCLAIMER. PoolRentalNearMe.com and RentalWaivers.com provide this template as a convenience and do not act as a party to this Agreement. Neither platform provides legal advice. Users are encouraged to consult with a licensed attorney in their jurisdiction to ensure this Agreement meets applicable state and local requirements.

BY SIGNING BELOW, I ACKNOWLEDGE THAT I HAVE READ THIS ENTIRE AGREEMENT, FULLY UNDERSTAND ITS TERMS, AND AGREE TO BE BOUND BY ITS PROVISIONS. I AM SIGNING THIS AGREEMENT VOLUNTARILY AND OF MY OWN FREE WILL.

This waiver template is provided free of charge by PoolRentalNearMe.com. Digital waivers, e-signatures, and automated delivery available at RentalWaivers.com.

DISCLAIMER: This document is a template and does not constitute legal advice. Consult a licensed attorney in your state for review.`,
  },
];

// US states for the dropdown
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming",
];

type WizardStep = "category" | "details" | "extras" | "preview";

export default function TemplateEditor() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Wizard state
  const [step, setStep] = useState<WizardStep>("category");
  const [selectedPreset, setSelectedPreset] = useState<TemplatePreset | null>(null);

  // Detail answers (keyed by variable name)
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Extras
  const [requirePhoto, setRequirePhoto] = useState(false);
  const [requireVideo, setRequireVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [defaultExpirationDays, setDefaultExpirationDays] = useState<string>("");

  // For blank template
  const [customName, setCustomName] = useState("");
  const [customContent, setCustomContent] = useState("");

  const [saving, setSaving] = useState(false);

  const setAnswer = (variable: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [variable]: value }));
  };

  const pickCategory = (preset: TemplatePreset) => {
    setSelectedPreset(preset);
    if (preset.id === "blank") {
      setStep("extras");
    } else {
      setStep("details");
    }
  };

  // Build the final template content by substituting business-level variables
  const buildContent = (): string => {
    if (!selectedPreset || selectedPreset.id === "blank") return customContent;

    let content = selectedPreset.content;
    // Only substitute business-level variables, leave per-guest ones as {{variables}}
    const businessVars = ["host_name", "address_redacted", "rules", "state"];
    businessVars.forEach((v) => {
      const value = answers[v] || "";
      if (value) {
        content = content.replace(new RegExp(`\\{\\{${v}\\}\\}`, "g"), value);
      }
    });
    return content;
  };

  const getTemplateName = (): string => {
    if (selectedPreset?.id === "blank") return customName;
    return selectedPreset?.name || "";
  };

  const getTemplateDescription = (): string => {
    if (selectedPreset?.id === "blank") return "";
    const parts: string[] = [];
    if (answers.host_name) parts.push(answers.host_name);
    if (answers.state) parts.push(answers.state);
    return parts.join(" — ") || selectedPreset?.description || "";
  };

  const handleSave = async () => {
    if (!profile?.org_id) {
      toast.error("Please set up your organization first");
      return;
    }

    const templateName = getTemplateName();
    if (!templateName.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (requireVideo && !videoUrl.trim()) {
      toast.error("Please enter a video URL when requiring a safety video");
      return;
    }

    setSaving(true);
    try {
      const content = buildContent();
      const { data: template, error: tErr } = await supabase
        .from("templates")
        .insert({
          org_id: profile.org_id,
          name: templateName.trim(),
          description: getTemplateDescription() || null,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          require_photo: requirePhoto,
          require_video: requireVideo,
          video_url: requireVideo && videoUrl.trim() ? videoUrl.trim() : null,
          default_expiration_days: defaultExpirationDays ? parseInt(defaultExpirationDays) : null,
        } as any)
        .select()
        .single();

      if (tErr) throw tErr;

      const detectedVars = defaultVariables.filter((v) => content.includes(`{{${v}}}`));
      const { error: vErr } = await supabase
        .from("template_versions")
        .insert({
          template_id: template.id,
          version: 1,
          content: { body: content },
          variables: detectedVars,
          is_current: true,
        });

      if (vErr) throw vErr;

      toast.success("Template created!");
      navigate("/templates");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const questions = selectedPreset && selectedPreset.id !== "blank"
    ? CATEGORY_QUESTIONS[selectedPreset.id] || COMMON_QUESTIONS
    : [];

  const allQuestionsAnswered = questions.every(
    (q) => q.variable === "rules" || (answers[q.variable] && answers[q.variable].trim())
  );

  // ─── Step 1: Pick a category ───────────────────────────────────────
  if (step === "category") {
    return (
      <DashboardLayout>
        <div className="animate-fade-in max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate("/templates")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-heading text-2xl font-bold">What type of waiver do you need?</h1>
              <p className="text-sm text-muted-foreground mt-1">Pick a category and we'll build it for you</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {TEMPLATE_PRESETS.map((preset) => (
              <Card
                key={preset.id}
                className="cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-colors"
                onClick={() => pickCategory(preset)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <preset.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{preset.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{preset.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-6 text-center">
            These templates are starting points only. Rental Waivers is not a law firm and does not provide legal advice. Have an attorney review your waiver before use.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Step 2: Answer a few questions ────────────────────────────────
  if (step === "details" && selectedPreset && selectedPreset.id !== "blank") {
    return (
      <DashboardLayout>
        <div className="animate-fade-in max-w-2xl">
          <div className="flex items-center gap-4 mb-2">
            <Button variant="ghost" size="icon" onClick={() => setStep("category")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-heading text-2xl font-bold">Tell us about your business</h1>
              <p className="text-sm text-muted-foreground mt-1">We'll fill in the waiver for you — just answer a few questions</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-8">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10">
              {selectedPreset.icon && <selectedPreset.icon className="h-3 w-3 text-primary" />}
            </div>
            <span className="text-sm text-muted-foreground">{selectedPreset.name}</span>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-6">
              {questions.map((q) => (
                <div key={q.variable} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {q.label}
                    {q.variable !== "rules" && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {q.variable === "state" ? (
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={answers[q.variable] || ""}
                      onChange={(e) => setAnswer(q.variable, e.target.value)}
                    >
                      <option value="">Select a state...</option>
                      {US_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : q.type === "textarea" ? (
                    <Textarea
                      placeholder={q.placeholder}
                      value={answers[q.variable] || ""}
                      onChange={(e) => setAnswer(q.variable, e.target.value)}
                      className="min-h-[100px]"
                    />
                  ) : (
                    <Input
                      placeholder={q.placeholder}
                      value={answers[q.variable] || ""}
                      onChange={(e) => setAnswer(q.variable, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep("category")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Button
              onClick={() => setStep("extras")}
              disabled={!allQuestionsAnswered}
              className="gap-2"
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Step 3: Extras (photo, video) ─────────────────────────────────
  if (step === "extras") {
    const isBlank = selectedPreset?.id === "blank";

    return (
      <DashboardLayout>
        <div className="animate-fade-in max-w-2xl">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => setStep(isBlank ? "category" : "details")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-heading text-2xl font-bold">
                {isBlank ? "Custom Template" : "Optional Extras"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isBlank ? "Name your template and add your waiver text" : "Add photo verification or a safety video"}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {isBlank && (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Template Name <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="My Custom Waiver"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Waiver Content</Label>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {defaultVariables.map((v) => (
                        <button
                          key={v}
                          onClick={() => setCustomContent((c) => c + `{{${v}}}`)}
                          className="rounded-md border bg-accent px-2 py-1 text-xs font-mono text-muted-foreground hover:bg-accent/80 transition-colors"
                        >
                          {`{{${v}}}`}
                        </button>
                      ))}
                    </div>
                    <Textarea
                      value={customContent}
                      onChange={(e) => setCustomContent(e.target.value)}
                      className="min-h-[300px] font-mono text-sm"
                      placeholder="Paste or write your waiver text here..."
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="require-photo" className="text-sm font-medium">Require Selfie Photo (+1 credit)</Label>
                    <p className="text-xs text-muted-foreground">Signers take a photo of themselves before submitting</p>
                  </div>
                  <Switch id="require-photo" checked={requirePhoto} onCheckedChange={setRequirePhoto} />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="require-video" className="text-sm font-medium">Require Safety Video (+1 credit)</Label>
                    <p className="text-xs text-muted-foreground">Signers must watch a video before they can sign</p>
                  </div>
                  <Switch id="require-video" checked={requireVideo} onCheckedChange={setRequireVideo} />
                </div>

                {requireVideo && (
                  <div className="space-y-2 ml-4 pl-4 border-l-2 border-primary/20">
                    <Label htmlFor="video-url">Video URL (YouTube or Vimeo)</Label>
                    <Input
                      id="video-url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Paste a YouTube or Vimeo link. Signers must watch this before they can sign.
                    </p>
                  </div>
                )}

                <div className="space-y-2 rounded-lg border p-4">
                  <Label htmlFor="default-expiration">Default Expiration (days)</Label>
                  <Input
                    id="default-expiration"
                    type="number"
                    min="1"
                    max="365"
                    placeholder="e.g. 7 (leave blank for no auto-expiration)"
                    value={defaultExpirationDays}
                    onChange={(e) => setDefaultExpirationDays(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Waivers created from this template will automatically expire after this many days if unsigned.
                  </p>
                </div>

                <div className="rounded-lg border border-dashed p-4 bg-accent/30">
                  <p className="text-sm font-medium">Estimated cost per signing</p>
                  <p className="text-2xl font-bold mt-1">
                    {1 + (requirePhoto ? 1 : 0) + (requireVideo ? 1 : 0)} credit{(1 + (requirePhoto ? 1 : 0) + (requireVideo ? 1 : 0)) > 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Base: 1{requirePhoto ? " + Photo: 1" : ""}{requireVideo ? " + Video: 1" : ""}
                    {" "}(+1 if org branding is configured)
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(isBlank ? "category" : "details")}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              {isBlank ? (
                <Button
                  onClick={handleSave}
                  disabled={saving || !customName.trim()}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" /> {saving ? "Creating..." : "Create Template"}
                </Button>
              ) : (
                <Button onClick={() => setStep("preview")} className="gap-2">
                  Preview <Eye className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Step 4: Preview & Save ────────────────────────────────────────
  if (step === "preview" && selectedPreset) {
    const previewContent = buildContent();

    return (
      <DashboardLayout>
        <div className="animate-fade-in max-w-2xl">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => setStep("extras")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-heading text-2xl font-bold">Preview Your Waiver</h1>
              <p className="text-sm text-muted-foreground mt-1">
                This is what your guests will see. Items like guest name, date, and booking ID will be filled in automatically when you send the waiver.
              </p>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                {selectedPreset.icon && <selectedPreset.icon className="h-4 w-4 text-primary" />}
                {selectedPreset.name}
                {answers.host_name && <span className="text-muted-foreground font-normal">— {answers.host_name}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-y-auto rounded-lg border bg-accent/20 p-6 text-sm leading-relaxed whitespace-pre-wrap">
                {previewContent}
              </div>
            </CardContent>
          </Card>

          {(requirePhoto || requireVideo) && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <p className="text-sm font-medium mb-3">Signing extras enabled:</p>
                <div className="space-y-2">
                  {requirePhoto && (
                    <div className="flex items-center gap-2 text-sm">
                      <ChevronRight className="h-3 w-3 text-primary" />
                      Selfie photo required
                    </div>
                  )}
                  {requireVideo && (
                    <div className="flex items-center gap-2 text-sm">
                      <ChevronRight className="h-3 w-3 text-primary" />
                      Safety video required
                      {videoUrl && <span className="text-muted-foreground">({videoUrl})</span>}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("extras")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2" size="lg">
              <Save className="h-4 w-4" /> {saving ? "Creating..." : "Create Template"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            You can always edit your template later. Rental Waivers is not a law firm and does not provide legal advice.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // Fallback
  return null;
}
