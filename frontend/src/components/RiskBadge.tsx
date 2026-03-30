import { clsx } from "clsx";
import { AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

const config = {
  high: {
    style: "bg-red-50 text-red-700 ring-1 ring-red-200/50",
    icon: AlertTriangle,
  },
  medium: {
    style: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/50",
    icon: AlertCircle,
  },
  low: {
    style: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50",
    icon: CheckCircle,
  },
};

export default function RiskBadge({
  level,
  size = "sm",
}: {
  level: string | null | undefined;
  size?: "sm" | "lg";
}) {
  if (!level) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-0.5 text-xs text-gray-400 ring-1 ring-gray-200/50">
        N/A
      </span>
    );
  }

  const key = level.toLowerCase() as keyof typeof config;
  const cfg = config[key];

  if (!cfg) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-0.5 text-xs text-gray-500">
        {level}
      </span>
    );
  }

  const Icon = cfg.icon;
  const isLarge = size === "lg";

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full font-semibold capitalize",
        cfg.style,
        isLarge ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-xs"
      )}
    >
      <Icon className={isLarge ? "h-3.5 w-3.5" : "h-3 w-3"} />
      {level}
    </span>
  );
}
