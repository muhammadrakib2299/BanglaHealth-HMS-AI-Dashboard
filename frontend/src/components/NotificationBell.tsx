"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

interface Alert {
  patient_id: number;
  patient_name: string;
  district: string;
  risk_score: number;
  predicted_at: string;
}

export default function NotificationBell() {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ["alerts"],
    queryFn: () =>
      apiFetch<{ count: number; alerts: Alert[] }>("/api/alerts/high-risk?limit=8", {
        token: token!,
      }),
    enabled: !!token,
    refetchInterval: 60_000,
  });

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const count = data?.count ?? 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white min-w-[18px] h-[18px]">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
          <div className="border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">
              High-Risk Alerts
            </h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {!data?.alerts?.length ? (
              <p className="px-4 py-6 text-center text-sm text-gray-400">
                No high-risk alerts
              </p>
            ) : (
              data.alerts.map((alert) => (
                <Link
                  key={`${alert.patient_id}-${alert.predicted_at}`}
                  href={`/patients/${alert.patient_id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 border-b border-gray-50 px-4 py-3 hover:bg-gray-50"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {alert.patient_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {alert.district} — Risk: {(alert.risk_score * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(alert.predicted_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
