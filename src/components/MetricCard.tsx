import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  description?: string;
  action?: ReactNode;
}

export function MetricCard({ title, value, icon: Icon, trend, description, action }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-heading">{value}</div>
        {trend && (
          <p className={`text-xs mt-1 ${trend.value >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
          </p>
        )}
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {action && <div className="mt-3">{action}</div>}
      </CardContent>
    </Card>
  );
}