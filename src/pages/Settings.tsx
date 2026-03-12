import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Globe, ExternalLink, Loader2, CreditCard, Zap, Coins, Palette, Image, Link, Gift, Copy, Check, Users } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/i18n";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
  const { profile, user, wallet } = useAuth();
  const { locale } = useI18n();
  const [orgName, setOrgName] = useState("");
  const [retentionYears, setRetentionYears] = useState(7);
  const [logoUrl, setLogoUrl] = useState("");
  const [brandColor, setBrandColor] = useState("#162a4a");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [socialUrl, setSocialUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingBrand, setSavingBrand] = useState(false);
  const [hasOrg, setHasOrg] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.org_id) return;
    supabase
      .from("organizations")
      .select("*")
      .eq("id", profile.org_id)
      .single()
      .then(({ data }) => {
        if (data) {
          setOrgName(data.name);
          setRetentionYears(data.retention_years);
          setLogoUrl(data.logo_url || "");
          setBrandColor(data.brand_color || "#162a4a");
          setWebsiteUrl((data as any).website_url || "");
          setSocialUrl((data as any).social_url || "");
          setHasOrg(true);
        }
      });

    // Fetch referral code from profile
    supabase
      .from("profiles")
      .select("referral_code")
      .eq("user_id", user?.id ?? "")
      .single()
      .then(({ data }) => {
        if (data?.referral_code) setReferralCode(data.referral_code);
      });

    // Fetch referrals
    supabase
      .from("referrals")
      .select("*")
      .eq("referrer_org_id", profile.org_id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setReferrals(data);
      });
  }, [profile?.org_id, user?.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (hasOrg && profile?.org_id) {
        const { error } = await supabase
          .from("organizations")
          .update({ name: orgName, retention_years: retentionYears })
          .eq("id", profile.org_id);
        if (error) throw error;
        toast.success("Settings saved");
      } else {
        // Use Edge Function to bypass RLS for org setup
        const storedRef = sessionStorage.getItem("referral_code");
        const { data, error } = await supabase.functions.invoke("setup-org", {
          body: { name: orgName, retention_years: retentionYears, referral_code: storedRef || undefined },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        setHasOrg(true);
        toast.success("Organization created! You are now an admin.");
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBranding = async () => {
    if (!profile?.org_id) return;
    setSavingBrand(true);
    try {
      const { error } = await supabase
        .from("organizations")
        .update({
          logo_url: logoUrl.trim() || null,
          brand_color: brandColor.trim() || null,
          website_url: websiteUrl.trim() || null,
          social_url: socialUrl.trim() || null,
        })
        .eq("id", profile.org_id);
      if (error) throw error;
      toast.success("Branding saved");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingBrand(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-2xl">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your organization</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Organization</CardTitle>
              <CardDescription>{hasOrg ? "Update your organization details" : "Create your organization to get started"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Acme Pool Rentals" />
              </div>
              <div className="space-y-2">
                <Label>PDF Retention (years)</Label>
                <Input type="number" min={1} max={99} value={retentionYears} onChange={(e) => setRetentionYears(Number(e.target.value))} />
              </div>
              <Button onClick={handleSave} disabled={saving || !orgName.trim()} className="gap-2">
                <Save className="h-4 w-4" /> {saving ? "Saving..." : hasOrg ? "Save Changes" : "Create Organization"}
              </Button>
            </CardContent>
          </Card>

          {hasOrg && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  Branding & Business Profile
                </CardTitle>
                <CardDescription>
                  Customize how your waivers look and share your business info. Adding branding costs +1 credit per signing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Image className="h-3.5 w-3.5 text-muted-foreground" />
                    Logo URL
                  </Label>
                  <Input
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://yourbusiness.com/logo.png"
                  />
                  <p className="text-xs text-muted-foreground">Direct link to your logo image (PNG, JPG, or SVG)</p>
                  {logoUrl && (
                    <div className="mt-2 rounded-lg border bg-accent/20 p-4 flex items-center justify-center">
                      <img
                        src={logoUrl}
                        alt="Logo preview"
                        className="max-h-16 max-w-[200px] object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                    Brand Color
                  </Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="h-10 w-12 rounded border cursor-pointer"
                    />
                    <Input
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      placeholder="#162a4a"
                      className="w-32 font-mono text-sm"
                    />
                    <div
                      className="h-10 flex-1 rounded-md border"
                      style={{ backgroundColor: brandColor }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Link className="h-3.5 w-3.5 text-muted-foreground" />
                    Website
                  </Label>
                  <Input
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourbusiness.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Link className="h-3.5 w-3.5 text-muted-foreground" />
                    Social Profile
                  </Label>
                  <Input
                    value={socialUrl}
                    onChange={(e) => setSocialUrl(e.target.value)}
                    placeholder="https://instagram.com/yourbusiness"
                  />
                  <p className="text-xs text-muted-foreground">Instagram, Facebook, TikTok, or any social page</p>
                </div>
                <Button onClick={handleSaveBranding} disabled={savingBrand} className="gap-2">
                  <Save className="h-4 w-4" /> {savingBrand ? "Saving..." : "Save Branding"}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Language</CardTitle>
              <CardDescription>Choose your preferred language</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={locale}
                  onValueChange={(v) => {
                    if ((window as any).__setLocale) (window as any).__setLocale(v);
                  }}
                >
                  <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Espanol</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {hasOrg && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Marketplace Integration
                </CardTitle>
                <CardDescription>
                  Automatically send waivers when customers book on ShareTribe or other marketplaces
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="gap-2" onClick={() => window.location.href = "/settings/marketplace"}>
                  <ExternalLink className="h-4 w-4" />
                  Configure Integration
                </Button>
              </CardContent>
            </Card>
          )}

          {hasOrg && referralCode && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />
                  Refer & Earn
                </CardTitle>
                <CardDescription>
                  Share your referral link. When your friend signs up and makes their first credit purchase, you both get <strong>250 free credits</strong>.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Your referral link</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={`https://rentalwaivers.com/login?ref=${referralCode}`}
                      className="font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://rentalwaivers.com/login?ref=${referralCode}`);
                        setCopied(true);
                        toast.success("Referral link copied!");
                        setTimeout(() => setCopied(false), 2000);
                      }}
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Your code: <span className="font-mono font-semibold">{referralCode}</span></p>
                </div>

                {referrals.length > 0 && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      Your referrals
                    </Label>
                    <div className="rounded-md border">
                      {referrals.map((r) => (
                        <div key={r.id} className="flex items-center justify-between px-3 py-2 text-sm border-b last:border-b-0">
                          <span className="text-muted-foreground truncate max-w-[200px]">{r.referred_email}</span>
                          <Badge variant={r.status === "completed" ? "default" : "secondary"}>
                            {r.status === "completed" ? "250 credits earned" : "Pending first purchase"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {hasOrg && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Coins className="h-4 w-4 text-primary" />
                  Credits
                </CardTitle>
                <CardDescription>
                  {wallet.credits} credits remaining
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="gap-2" onClick={() => window.location.href = "/pricing"}>
                  <CreditCard className="h-4 w-4" />
                  Buy Credits
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
