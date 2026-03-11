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
import { ArrowLeft, Save, FileText, Droplets, Home, Wrench, PartyPopper, Ship, CarFront, Bike, Truck } from "lucide-react";
import { toast } from "sonner";

const defaultVariables = [
  "customer_name", "booking_id", "listing_id", "date", "time",
  "host_name", "address_redacted", "rules", "state",
];

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
    description: "Start from scratch",
    icon: FileText,
    content: "",
  },
  {
    id: "pool",
    name: "Pool / Hot Tub Rental",
    description: "Swimply hosts, backyard pools, hot tubs",
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
    name: "Vacation Rental Property",
    description: "Airbnb, VRBO, short-term rental homes",
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
    description: "Bikes, kayaks, tools, sports gear, cameras",
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
    name: "Event / Venue Rental",
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
    name: "Boat / Jet Ski Rental",
    description: "Watercraft, pontoons, jet skis, wave runners",
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
    name: "ATV / Off-Road Vehicle",
    description: "ATVs, UTVs, dirt bikes, off-road vehicles",
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
    name: "Bounce House / Inflatable",
    description: "Bounce houses, water slides, inflatable rentals",
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
    name: "RV / Camper Van Rental",
    description: "Motorhomes, camper vans, travel trailers",
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
    name: "Bike / Scooter Rental",
    description: "Bicycles, e-bikes, electric scooters, mopeds",
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
];

export default function TemplateEditor() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [requireSigning, setRequireSigning] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickPreset = (preset: TemplatePreset) => {
    setSelectedPreset(preset.id);
    setContent(preset.content);
    if (preset.id !== "blank") {
      setName(preset.name);
      setDescription(preset.description);
    }
  };

  const handleSave = async () => {
    if (!profile?.org_id) {
      toast.error("Please set up your organization first");
      return;
    }
    if (!name.trim()) {
      toast.error("Template name is required");
      return;
    }

    setSaving(true);
    try {
      // Create template
      const { data: template, error: tErr } = await supabase
        .from("templates")
        .insert({
          org_id: profile.org_id,
          name: name.trim(),
          description: description.trim() || null,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (tErr) throw tErr;

      // Create initial version
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

      toast.success("Template created");
      navigate("/templates");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!selectedPreset) {
    return (
      <DashboardLayout>
        <div className="animate-fade-in max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate("/templates")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-heading text-2xl font-bold">Choose a Starting Point</h1>
              <p className="text-sm text-muted-foreground mt-1">Pick a template to customize, or start from scratch</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {TEMPLATE_PRESETS.map((preset) => (
              <Card
                key={preset.id}
                className="cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-colors"
                onClick={() => pickPreset(preset)}
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

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => setSelectedPreset(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold">New Template</h1>
            <p className="text-sm text-muted-foreground mt-1">Create a reusable waiver template</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input placeholder="Pool Liability Waiver" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Standard waiver for pool bookings" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="require-signing" className="text-sm font-medium">Require signing before booking confirmation</Label>
                  <p className="text-xs text-muted-foreground">When enabled, bookings won't be confirmed until the waiver is signed</p>
                </div>
                <Switch id="require-signing" checked={requireSigning} onCheckedChange={setRequireSigning} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Template Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex flex-wrap gap-2">
                {defaultVariables.map((v) => (
                  <button
                    key={v}
                    onClick={() => setContent((c) => c + `{{${v}}}`)}
                    className="rounded-md border bg-accent px-2 py-1 text-xs font-mono text-muted-foreground hover:bg-accent/80 transition-colors"
                  >
                    {`{{${v}}}`}
                  </button>
                ))}
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate("/templates")}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Template"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
