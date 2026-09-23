import { useState } from "react";
import { Link } from "react-router-dom";
import { SeoPageLayout, SeoHero, SeoSection, SeoFaq, SeoCta } from "@/components/SeoPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, Copy, Check, Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema, howToSchema } from "@/lib/structured-data";
import { stateWaiverLawPages } from "@/lib/state-waiver-laws";

const BUSINESS_TYPES = [
  "Apartment complex / multifamily community",
  "Apartment or community swimming pool",
  "Apartment fitness center / resident gym",
  "HOA or community association amenity",
  "Property management company (multiple properties)",
  "Landlord / single-family rental with a pool or hot tub",
  "Short-term rental / Airbnb / vacation rental",
  "Student housing or co-living community",
  "Senior living community",
  "Mobile home or RV park",
  "Campground / RV resort",
  "Self storage facility",
  "Clubhouse or event space rental",
  "Bounce house / party rental",
  "Boat, jet ski or watercraft rental",
  "ATV, dirt bike or powersports rental",
  "Bike, kayak or paddleboard rental",
  "Gym, studio or fitness class",
  "Tour, activity or adventure operator",
  "Equipment or tool rental",
  "Other rental business",
];

const FAQ_ITEMS = [
  {
    question: "Is the waiver generator really free?",
    answer:
      "Yes. Generating and downloading a waiver costs nothing and requires no account or credit card. You only pay if you also want people to sign it electronically through RentalWaivers — and even then, your first 250 signatures are free.",
  },
  {
    question: "What does it cost after the 250 free signatures?",
    answer:
      "6¢ per signed waiver, bought as credits. There is no monthly subscription, no contract, and no minimum. If you collect nothing this month, you pay nothing this month.",
  },
  {
    question: "Can I use this for an apartment pool or HOA amenity?",
    answer:
      "Yes. Housing is the most common use we see. Pick your community type and the generator writes amenity-specific language — no-lifeguard-on-duty notice, guest passes, unsupervised-minor rules, unit or lot number capture, and a governing-law clause for your state.",
  },
  {
    question: "Is a generated waiver legally binding?",
    answer:
      "The document itself is a starting point, not legal advice — have an attorney in your state review it. Once signed electronically through RentalWaivers, the signature is binding under the federal E-SIGN Act and state UETA laws, with a timestamp, IP address, and full audit trail attached.",
  },
  {
    question: "Can I edit the waiver after it's generated?",
    answer:
      "Yes. Copy it, download it, edit it in any word processor, or paste it straight into a RentalWaivers template and change anything you want before sending it out.",
  },
  {
    question: "Do you handle minors and guardian signatures?",
    answer:
      "Yes. Tick the minors box and the generator adds a guardian consent section. In the app, each minor's name and age is collected and the guardian signs on their behalf, with both captured on the final PDF.",
  },
];

export default function FreeWaiverGeneratorPage() {
  const [businessType, setBusinessType] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [stateName, setStateName] = useState("");
  const [activities, setActivities] = useState("");
  const [minors, setMinors] = useState(true);
  const [loading, setLoading] = useState(false);
  const [waiver, setWaiver] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!businessType) {
      toast.error("Pick what kind of business this waiver is for.");
      return;
    }
    setLoading(true);
    setWaiver("");
    try {
      const { data, error } = await supabase.functions.invoke("generate-waiver", {
        body: { businessType, businessName, state: stateName, activities, minors },
      });
      if (error) {
        const detail = (error as { context?: { text?: () => Promise<string> } }).context?.text
          ? await (error as { context: { text: () => Promise<string> } }).context.text()
          : "";
        let message = "The generator is busy right now. Give it another try in a moment.";
        try {
          const parsed = JSON.parse(detail);
          if (parsed?.error) message = parsed.error;
        } catch {
          /* keep default */
        }
        toast.error(message);
        return;
      }
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setWaiver(data?.waiver ?? "");
      toast.success("Your waiver is ready. Scroll down to read it.");
    } catch {
      toast.error("Something went wrong. Text 909-272-8096 and we'll send you a template.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(waiver);
    setCopied(true);
    toast.success("Waiver copied to your clipboard.");
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([waiver], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(businessName || "liability").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-waiver.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SeoPageLayout
      metaTitle="Free Liability Waiver Generator — Build a Custom Waiver in 60 Seconds"
      metaDescription="Generate a free custom liability waiver for apartments, HOAs, rentals, and activity businesses. No account, no credit card. Then collect signatures for 6¢ each — 250 free, no monthly fee."
      canonicalPath="/free-waiver-generator"
    >
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "https://www.rentalwaivers.com/" },
            { name: "Free Waiver Generator", url: "https://www.rentalwaivers.com/free-waiver-generator" },
          ]),
          faqSchema(FAQ_ITEMS),
          howToSchema({
            name: "How to create a free liability waiver",
            description:
              "Generate a custom liability waiver for your rental, housing community, or activity business in under a minute.",
            steps: [
              { name: "Describe your business", text: "Pick your business or community type, your state, and what people will be doing." },
              { name: "Generate the waiver", text: "The generator drafts a full waiver with the specific risks, rules, and guardian language your situation needs." },
              { name: "Review and edit", text: "Copy or download the text and have an attorney in your state review it." },
              { name: "Collect signatures", text: "Paste it into RentalWaivers and send it out. Your first 250 signatures are free, then 6¢ each." },
            ],
          }),
        ]}
      />

      <SeoHero
        badge="Free · No account required"
        h1="Free Liability Waiver Generator"
        subtitle="A custom waiver for your apartments, rentals, or activities — written in about a minute"
        description="Tell us what you rent out or who uses your amenities and we'll draft a complete liability waiver with the specific risks, rules, and guardian consent language your situation calls for. Download it free. When you're ready to collect real signatures, your first 250 are free and everything after that is 6¢ — no monthly subscription, ever."
      />

      <SeoSection title="Build Your Waiver">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="btype">What is this waiver for? *</Label>
                <Select value={businessType} onValueChange={setBusinessType}>
                  <SelectTrigger id="btype" className="mt-1.5">
                    <SelectValue placeholder="Choose your business or community type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {BUSINESS_TYPES.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bname">Business or community name</Label>
                <Input
                  id="bname"
                  className="mt-1.5"
                  placeholder="Sunrise Apartments"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  maxLength={120}
                />
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                <Select value={stateName} onValueChange={setStateName}>
                  <SelectTrigger id="state" className="mt-1.5">
                    <SelectValue placeholder="Choose your state" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {stateWaiverLawPages.map((s) => (
                      <SelectItem key={s.slug} value={s.state}>
                        {s.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="acts">What will people be doing or using?</Label>
                <Textarea
                  id="acts"
                  className="mt-1.5"
                  rows={3}
                  placeholder="Swimming pool and hot tub, 24-hour fitness center, playground, clubhouse rentals"
                  value={activities}
                  onChange={(e) => setActivities(e.target.value)}
                  maxLength={400}
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="minors" checked={minors} onCheckedChange={(v) => setMinors(v === true)} />
                <Label htmlFor="minors" className="font-normal">
                  Children under 18 will be included
                </Label>
              </div>

              <Button onClick={generate} disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Writing your waiver…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Generate my free waiver
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Free, no sign-up. This is a starting point, not legal advice — have an attorney in your state review it
                before you use it.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              {waiver ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copy}>
                      {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={download}>
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                    <Button size="sm" asChild>
                      <Link to="/auth">
                        Send it for signature <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <pre className="max-h-[32rem] overflow-y-auto whitespace-pre-wrap rounded-md bg-muted p-4 text-xs leading-relaxed text-foreground">
                    {waiver}
                  </pre>
                </div>
              ) : (
                <div className="flex h-full min-h-64 flex-col items-center justify-center text-center text-sm text-muted-foreground">
                  <Sparkles className="mb-3 h-6 w-6 text-primary" />
                  <p className="max-w-xs">
                    Your custom waiver will appear here. Most take about 30 seconds to write.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SeoSection>

      <SeoSection title="Free Waiver, Then the Cheapest Signatures Anywhere" muted>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { h: "$0", p: "To generate, edit and download your waiver. No account, no card, no email required." },
            { h: "250 free", p: "Signatures included when you create an account — enough for most small properties to run for months." },
            { h: "6¢ each", p: "After that. Credits only, no monthly fee, no contract. A slow month costs you nothing." },
          ].map((x) => (
            <Card key={x.h}>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary mb-1">{x.h}</div>
                <p className="text-sm text-muted-foreground">{x.p}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          A 200-unit apartment community collecting 400 amenity waivers a year pays about $24. The same year on a $49/month
          waiver subscription costs $588. See the full breakdown on our{" "}
          <Link to="/cheapest-waiver-software" className="text-primary">
            cheapest waiver software
          </Link>{" "}
          comparison.
        </p>
      </SeoSection>

      <SeoSection title="Popular Free Waivers People Generate Here">
        <div className="flex flex-wrap gap-2">
          {[
            ["Apartment pool waiver", "/industries/apartment-pool-waiver-software"],
            ["Apartment gym waiver", "/industries/apartment-gym-waiver-software"],
            ["HOA amenity waiver", "/industries/hoa-amenity-waiver-software"],
            ["Apartment complex waiver", "/industries/apartment-complex-waiver-software"],
            ["Landlord / rental property waiver", "/industries/landlord-waiver-software"],
            ["Short-term rental waiver", "/p/vacation-rental-waiver"],
            ["Student housing waiver", "/industries/student-housing-waiver-software"],
            ["Campground waiver", "/industries/campground-waiver-software"],
            ["Self storage waiver", "/industries/self-storage-waiver-software"],
            ["Senior living waiver", "/industries/senior-living-waiver-software"],
            ["Clubhouse & event space waiver", "/industries/event-space-rental-waiver-software"],
            ["Free waiver PDF template", "/p/rental-liability-waiver"],
          ].map(([label, href]) => (
            <Link
              key={href}
              to={href}
              className="rounded-full border px-3 py-1.5 text-xs hover:border-primary transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </SeoSection>

      <SeoFaq items={FAQ_ITEMS} />

      <SeoCta
        headline="Generated your waiver? Start collecting signatures free"
        subtext="250 signatures on the house, then 6¢ each. No monthly fee, no contract, cancel nothing."
      />
    </SeoPageLayout>
  );
}
