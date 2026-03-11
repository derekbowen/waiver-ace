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
