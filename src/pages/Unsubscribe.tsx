import { useEffect, useState } from "react";
import { useNoindex } from "@/hooks/useNoindex";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, MailX } from "lucide-react";

type Status = "loading" | "valid" | "already" | "invalid" | "confirming" | "done" | "error";

const Unsubscribe = () => {
  useNoindex();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    validateToken(token);
  }, [token]);

  const validateToken = async (t: string) => {
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(t)}`;
      const res = await fetch(url, {
        headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("invalid");
      } else if (data.valid === false && data.reason === "already_unsubscribed") {
        setStatus("already");
      } else if (data.valid) {
        setStatus("valid");
      } else {
        setStatus("invalid");
      }
    } catch {
      setStatus("error");
    }
  };

  const handleUnsubscribe = async () => {
    if (!token) return;
    setStatus("confirming");
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if (data?.success) {
        setStatus("done");
      } else if (data?.reason === "already_unsubscribed") {
        setStatus("already");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="h-10 w-10 mx-auto animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Validating your request...</p>
            </>
          )}

          {status === "valid" && (
            <>
              <MailX className="h-10 w-10 mx-auto text-primary" />
              <h2 className="text-xl font-semibold">Unsubscribe from emails</h2>
              <p className="text-muted-foreground text-sm">
                You'll no longer receive notification emails from Rental Waivers.
                Important account emails (like password resets) will still be sent.
              </p>
              <Button onClick={handleUnsubscribe} className="mt-4">
                Confirm Unsubscribe
              </Button>
            </>
          )}

          {status === "confirming" && (
            <>
              <Loader2 className="h-10 w-10 mx-auto animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Processing...</p>
            </>
          )}

          {status === "done" && (
            <>
              <CheckCircle2 className="h-10 w-10 mx-auto text-green-600" />
              <h2 className="text-xl font-semibold">You've been unsubscribed</h2>
              <p className="text-muted-foreground text-sm">
                You won't receive any more notification emails from us.
              </p>
            </>
          )}

          {status === "already" && (
            <>
              <CheckCircle2 className="h-10 w-10 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-semibold">Already unsubscribed</h2>
              <p className="text-muted-foreground text-sm">
                This email address has already been unsubscribed.
              </p>
            </>
          )}

          {status === "invalid" && (
            <>
              <XCircle className="h-10 w-10 mx-auto text-destructive" />
              <h2 className="text-xl font-semibold">Invalid link</h2>
              <p className="text-muted-foreground text-sm">
                This unsubscribe link is invalid or has expired.
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-10 w-10 mx-auto text-destructive" />
              <h2 className="text-xl font-semibold">Something went wrong</h2>
              <p className="text-muted-foreground text-sm">
                Please try again later or contact support.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Unsubscribe;
