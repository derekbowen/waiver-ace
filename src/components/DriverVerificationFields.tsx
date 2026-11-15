import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { DriverDetails } from "@/lib/golf-cart-template";

export function DriverVerificationFields({ value, onChange }: { value: DriverDetails; onChange: (value: DriverDetails) => void }) {
  const update = (key: keyof DriverDetails, next: string | boolean) => onChange({ ...value, [key]: next });
  return <section className="space-y-4 border-t pt-4">
    <h2 className="font-heading font-semibold">Driver verification</h2>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2"><Label htmlFor="driver-age">Driver age *</Label><Input id="driver-age" inputMode="numeric" maxLength={3} value={value.age} onChange={e => update("age", e.target.value.replace(/\D/g, ""))} /></div>
      <div className="space-y-2"><Label htmlFor="driver-jurisdiction">License issuing state / country *</Label><Input id="driver-jurisdiction" maxLength={100} value={value.licenseJurisdiction} onChange={e => update("licenseJurisdiction", e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="driver-license">License identifier — last four only *</Label><Input id="driver-license" autoComplete="off" maxLength={4} value={value.licenseLastFour} onChange={e => update("licenseLastFour", e.target.value.replace(/[^a-zA-Z0-9]/g, ""))} /></div>
      <div className="space-y-2"><Label htmlFor="driver-expiration">License expiration date *</Label><Input id="driver-expiration" type="date" className="min-w-0" value={value.licenseExpiration} onChange={e => update("licenseExpiration", e.target.value)} /></div>
    </div>
    <div className="flex items-start gap-3"><Checkbox id="driver-safety" checked={value.safetyAcknowledged} onCheckedChange={c => update("safetyAcknowledged", c === true)} /><Label htmlFor="driver-safety" className="text-sm leading-relaxed">I am signing as this driver. I acknowledge the safety rules, approved routes, passenger limits, no impaired driving, no unauthorized drivers, and accident-reporting obligations. Staff must inspect my license and approve me before I drive.</Label></div>
  </section>;
}