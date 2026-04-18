import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";

type StatusVariant = "active" | "suspended" | "trial" | "pending" | "paid" | "overdue" | "cancelled" | "past_due";

interface StatusBadgeProps {
  status: StatusVariant;
  type?: "business" | "customer" | "invoice";
  children?: ReactNode;
}

const statusConfig: Record<StatusVariant, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  trial: { label: "Trial", className: "bg-blue-100 text-blue-700 border-blue-200" },
  suspended: { label: "Suspended", className: "bg-amber-100 text-amber-700 border-amber-200" },
  pending: { label: "Pending", className: "bg-slate-100 text-slate-700 border-slate-200" },
  paid: { label: "Paid", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  overdue: { label: "Overdue", className: "bg-red-100 text-red-700 border-red-200" },
  cancelled: { label: "Cancelled", className: "bg-slate-100 text-slate-700 border-slate-200" },
  past_due: { label: "Past Due", className: "bg-amber-100 text-amber-700 border-amber-200" },
};

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant="outline" className={config.className}>
      {children || config.label}
    </Badge>
  );
}