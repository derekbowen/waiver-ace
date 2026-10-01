import { Link } from "react-router-dom";
import { isNativeIOS } from "@/lib/platform";

export const IOS_CREDITS_MESSAGE = "Credits are managed on the website.";

/**
 * "Add credits" link on the web. Inside the native iOS app it renders a neutral
 * message instead (App Store Guideline 3.1.1 — no purchase UI on iOS).
 */
export function BuyCreditsLink({
  children = "Add credits",
  className = "text-primary underline",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  if (isNativeIOS()) {
    return <span className="text-muted-foreground">{IOS_CREDITS_MESSAGE}</span>;
  }
  return (
    <Link to="/pricing" className={className}>
      {children}
    </Link>
  );
}
