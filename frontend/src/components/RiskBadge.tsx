import { clsx } from "clsx";

const styles = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
};

export default function RiskBadge({
  level,
}: {
  level: string | null | undefined;
}) {
  if (!level) return <span className="text-xs text-gray-400">N/A</span>;

  const key = level.toLowerCase() as keyof typeof styles;

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        styles[key] || "bg-gray-100 text-gray-600"
      )}
    >
      {level}
    </span>
  );
}
