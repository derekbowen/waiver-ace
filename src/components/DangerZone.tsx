import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const REQUIRED_PHRASE = "DELETE MY ACCOUNT";

export function DangerZone() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [deleting, setDeleting] = useState(false);

  const canDelete = phrase.trim() === REQUIRED_PHRASE && !deleting;

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-account", {
        body: { confirm: REQUIRED_PHRASE },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);

      toast.success("Account deleted. Goodbye.");
      // Sign out locally and route to landing
      await supabase.auth.signOut();
      setTimeout(() => {
        navigate("/", { replace: true });
        // Hard reload to clear any cached state
        window.location.href = "/";
      }, 800);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to delete account";
      toast.error(msg);
      setDeleting(false);
    }
  };

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          Danger Zone
        </CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Deleting your account will:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>Sign you out of every device immediately</li>
            <li>
              Permanently remove your profile, signed waivers, templates, audit trails, credits,
              and uploaded files
            </li>
            <li>
              If you are the last member of your organization, the entire organization and all of
              its data will be deleted
            </li>
            <li>Cancel any pending team invites you sent</li>
          </ul>
          <p className="pt-2">
            Any unused credits will be forfeited and cannot be refunded after deletion.
          </p>
        </div>

        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setPhrase(""); }}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete my account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Permanently delete your account?
              </DialogTitle>
              <DialogDescription>
                This will permanently erase your account, signed waivers, templates, audit
                history, and uploaded files. This action <strong>cannot be undone</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 py-2">
              <Label htmlFor="confirm-phrase" className="text-sm">
                Type <span className="font-mono font-semibold">{REQUIRED_PHRASE}</span> to confirm
              </Label>
              <Input
                id="confirm-phrase"
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                placeholder={REQUIRED_PHRASE}
                autoComplete="off"
                disabled={deleting}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={!canDelete}
                onClick={handleDelete}
                className="gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Permanently delete
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
