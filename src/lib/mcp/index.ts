import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listWaiversTool from "./tools/list-waivers";
import getWaiverTool from "./tools/get-waiver";
import listTemplatesTool from "./tools/list-templates";
import sendWaiverTool from "./tools/send-waiver";
import accountSummaryTool from "./tools/account-summary";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "rental-waivers",
  title: "Rental waivers",
  version: "0.1.0",
  instructions:
    "Tools for Rental Waivers, a digital liability waiver platform. Use `account_summary` for credits and waiver counts, `list_templates` to find a template id, `send_waiver` to email a waiver to a guest, and `list_waivers` / `get_waiver` to check signing status.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [accountSummaryTool, listTemplatesTool, sendWaiverTool, listWaiversTool, getWaiverTool],
});
