import { Link } from "react-router-dom";
import { SeoPageLayout, SeoHero, SeoSection, SeoFaq, SeoCta } from "@/components/SeoPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Waves, Bike, Ship, Zap, Snowflake, Truck, PartyPopper, CarFront, Wrench, Tent, ArrowRight } from "lucide-react";

const industries = [
  { name: "Kayak Rentals", slug: "kayak-rental-waiver-software", icon: Waves, desc: "Digital waivers for kayak and paddle sport rental operators" },
  { name: "Bike Rentals", slug: "bike-rental-waiver-software", icon: Bike, desc: "QR code waivers for urban and tourism bike rental shops" },
  { name: "Boat Rentals", slug: "boat-rental-waiver-software", icon: Ship, desc: "Liability waivers for marina and boat rental operations" },
  { name: "Jet Ski Rentals", slug: "jet-ski-rental-waiver-software", icon: Waves, desc: "High-liability watercraft rental waiver management" },
  { name: "ATV Rentals", slug: "atv-rental-waiver-software", icon: CarFront, desc: "Off-road rental waiver software with safety acknowledgments" },
  { name: "Scooter Rentals", slug: "scooter-rental-waiver-software", icon: Zap, desc: "Electric and motor scooter rental liability waivers" },
  { name: "Paddleboard Rentals", slug: "paddleboard-rental-waiver-software", icon: Waves, desc: "SUP rental waivers with group signing support" },
  { name: "Equipment Rentals", slug: "equipment-rental-waiver-software", icon: Wrench, desc: "Construction and tool rental liability management" },
  { name: "Bounce House Rentals", slug: "bounce-house-rental-waiver-software", icon: PartyPopper, desc: "Party rental waivers for inflatable equipment" },
  { name: "Ski & Snowboard", slug: "ski-rental-waiver-software", icon: Snowflake, desc: "Resort and ski shop rental waiver software" },
  { name: "Golf Cart Rentals", slug: "golf-cart-rental-waiver-software", icon: CarFront, desc: "Resort and community golf cart rental waivers" },
  { name: "RV Rentals", slug: "rv-rental-waiver-software", icon: Truck, desc: "Motorhome and camper van rental liability waivers" },
  { name: "Horse & Trail Rides", slug: "horse-rental-waiver-software", icon: Waves, desc: "Equestrian liability waivers for trail riding operations" },
  { name: "Tool Rentals", slug: "tool-rental-waiver-software", icon: Wrench, desc: "Hardware and power tool rental liability management" },
  { name: "Party Rentals", slug: "party-rental-waiver-software", icon: PartyPopper, desc: "Event equipment rental waivers for tables, tents, and gear" },
];

export default function IndustriesHubPage() {
  return (
    <SeoPageLayout
      metaTitle="Waiver Software by Industry | Rental, Recreation & More | RentalWaivers"
      metaDescription="Find waiver software built for your specific industry. Kayak, boat, ATV, bike, jet ski, scooter, equipment, and more. Pay per waiver — no monthly fees."
    >
      <SeoHero
        badge="Every Rental Type Covered"
        h1="Waiver Software by Industry"
        subtitle="Purpose-built digital waivers for rental, recreation, and outdoor businesses"
        description="Generic waiver software treats every business the same. RentalWaivers is designed around the specific workflows, risk profiles, and seasonal patterns of rental businesses. Find your industry below and see how we solve your exact waiver challenges."
      />

      <SeoSection title="Browse by Rental Type" muted>
        <div className="grid md:grid-cols-3 gap-4">
          {industries.map((ind) => (
            <Link to={`/industries/${ind.slug}`} key={ind.slug}>
              <Card className="h-full hover:border-primary/40 transition-colors group">
                <CardContent className="pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-3">
                    <ind.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{ind.name}</h3>
                  <p className="text-sm text-muted-foreground">{ind.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="Why Rental Businesses Need Specialized Waiver Software">
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>Rental businesses have unique requirements that generic waiver platforms don't address:</p>
          <ul className="space-y-3 list-disc list-inside">
            <li><strong className="text-foreground">Seasonal Volume</strong> — Most rental operations are seasonal. Paying $49/month through winter when your kayak shop is closed is wasted money. Pay-per-waiver pricing aligns cost with actual usage.</li>
            <li><strong className="text-foreground">Check-In Speed</strong> — Rental customers arrive excited and ready to go. They don't want to fill out a clipboard. QR code signing gets waivers done in 60 seconds on their phone.</li>
            <li><strong className="text-foreground">Group Bookings</strong> — Tour groups, family rentals, and party bookings mean multiple signers per reservation. Group signing links handle any party size with one URL.</li>
            <li><strong className="text-foreground">Remote Locations</strong> — Boat launches, trail heads, and outdoor rental counters often have spotty internet. Offline-capable waiver signing is essential.</li>
            <li><strong className="text-foreground">High-Liability Activities</strong> — Jet skis, ATVs, boats, and horses involve inherent risk. Your waiver system needs bulletproof audit trails and legal defensibility.</li>
          </ul>
        </div>
      </SeoSection>

      <SeoSection title="Short-Term Rental & Hospitality" muted>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { name: "Airbnb Hosts", slug: "airbnb-host-waivers", desc: "Auto-send property waivers when guests book. Pool rules, house rules, damage policies." },
            { name: "Vacation Rentals", slug: "vacation-rental-waivers", desc: "VRBO, Booking.com, and direct booking hosts with amenity liability coverage." },
            { name: "Short-Term Rentals", slug: "short-term-rental-waivers", desc: "Digital waivers for any short-term rental property — pools, hot tubs, and amenities." },
            { name: "Property Managers", slug: "property-manager-waivers", desc: "Multi-property waiver management for property management companies." },
          ].map((item) => (
            <Link to={`/waivers/${item.slug}`} key={item.slug}>
              <Card className="h-full hover:border-primary/40 transition-colors">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="More Rental Categories">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: "Hot Tub Rentals", slug: "hot-tub-rental-waivers", desc: "Liability waivers for hot tub and spa rental operators" },
            { name: "Surfboard Rentals", slug: "surfboard-rental-waivers", desc: "Beach and surf shop rental waiver management" },
            { name: "Event Rentals", slug: "event-rental-waivers", desc: "Waivers for event equipment and venue rentals" },
          ].map((item) => (
            <Link to={`/waivers/${item.slug}`} key={item.slug}>
              <Card className="h-full hover:border-primary/40 transition-colors group">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </SeoSection>

      <SeoFaq items={[
        { question: "Do you have waiver software for my specific rental type?", answer: "Yes! We serve kayak, bike, boat, jet ski, ATV, scooter, paddleboard, equipment, bounce house, ski, golf cart, RV, horse, tool, and party rental businesses — plus short-term rental hosts and vacation properties." },
        { question: "Is the waiver software different for each industry?", answer: "The core platform is the same, but you customize your waiver templates for your specific rental type. Each industry page includes guidance on what clauses and fields to include for maximum legal protection." },
        { question: "Can I use RentalWaivers for multiple rental types?", answer: "Absolutely. Create different waiver templates for each rental type you offer and manage them all from one dashboard. Perfect for multi-activity operators." },
        { question: "What does it cost?", answer: "Pay-per-waiver starting at 6¢. No monthly fees, no contracts. Buy credits in bulk for better rates. Perfect for seasonal operations." },
      ]} />

      <SeoCta
        headline="Find your industry and get started"
        subtext="Purpose-built waiver software for every rental type. No monthly fees."
      />
    </SeoPageLayout>
  );
}
