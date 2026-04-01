import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileSearch, Loader2, CheckCircle, Clock, Mail } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Footer } from "@/components/Footer";

interface WaiverResult {
  envelope_id: string;
  signer_name: string | null;
  status: string;
  signed_at: string | null;
  created_at: string;
  template_name: string;
  org_name: string;
}

export default function FindMyWaiver() {
  const [email, setEmail] = useState("");
  const [results, setResults] = useState<WaiverResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const { data, error } = await supabase.rpc("find_waivers_by_email", {
        p_email: trimmed,
      });
      if (error) throw error;
      setResults((data as WaiverResult[]) || []);
    } catch {
      toast.error("Something went wrong. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="container flex h-14 items-center gap-2">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-primary">
              <FileSearch className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-heading text-sm font-bold">Rental Waivers</span>
          </a>
        </div>
      </header>

      <main className="flex-1 container max-w-xl py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">Find My Waivers</h1>
          <p className="text-muted-foreground">
            Look up waivers you've signed by entering the email address you used during signing.
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />}
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && searched && results && results.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileSearch className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground text-center">
                No signed waivers found for this email address.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-2">
                Make sure you're using the same email you provided when signing.
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && results && results.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Found {results.length} signed waiver{results.length !== 1 ? "s" : ""}
            </p>
            {results.map((w) => (
              <Card key={w.envelope_id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 shrink-0 mt-0.5">
                        <CheckCircle className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="font-medium">{w.template_name}</p>
                        <p className="text-sm text-muted-foreground">{w.org_name}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {w.signed_at
                            ? format(new Date(w.signed_at), "MMM d, yyyy 'at' h:mm a")
                            : format(new Date(w.created_at), "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize shrink-0">
                      {w.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground/60 mt-8">
          For questions about a specific waiver, please contact the organization that sent it.
        </p>
      </main>

      <Footer />
    </div>
  );
}
