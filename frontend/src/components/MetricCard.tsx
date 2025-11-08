import { type ReactNode } from "react";
import { Card } from "./ui/card";
import { cn } from "../lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function MetricCard({ label, value, unit, icon, trend, className }: MetricCardProps) {
  return (
    <Card className={cn("glass-panel p-6", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="metric-label">{label}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="metric-value">{value}</span>
            {unit && <span className="text-lg text-muted-foreground">{unit}</span>}
          </div>
        </div>
        {icon && (
          <div className="text-primary/60">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-2 text-xs">
          <span className={cn(
            "font-medium",
            trend === "up" && "text-status-success",
            trend === "down" && "text-status-error",
            trend === "neutral" && "text-muted-foreground"
          )}>
            {trend === "up" && "↑"} {trend === "down" && "↓"} {trend === "neutral" && "→"}
          </span>
        </div>
      )}
    </Card>
  );
}
