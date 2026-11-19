import { Link } from "react-router-dom";
import { isNativeIOS, openCreditsPage } from "@/lib/platform";

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
    return (
      <button type="button" onClick={openCreditsPage} className={className}>
        {children}
      </button>
    );
  }
  return (
    <Link to="/pricing" className={className}>
      {children}
    </Link>
  );
}
