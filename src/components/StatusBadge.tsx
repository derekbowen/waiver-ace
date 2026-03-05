import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  sent: { label: "Sent", className: "bg-primary/10 text-primary" },
  viewed: { label: "Viewed", className: "bg-warning/10 text-warning" },
  signed: { label: "Signed", className: "bg-success/10 text-success" },
  completed: { label: "Completed", className: "bg-success/15 text-success" },
  expired: { label: "Expired", className: "bg-destructive/10 text-destructive" },
  canceled: { label: "Canceled", className: "bg-muted text-muted-foreground" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: "bg-muted text-muted-foreground" };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
