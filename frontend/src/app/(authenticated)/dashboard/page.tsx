"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Users,
  AlertTriangle,
  Activity,
  Calendar,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { StatCardSkeleton, ChartSkeleton } from "@/components/Skeleton";
import RiskBadge from "@/components/RiskBadge";
import type { DashboardStats, PatientList } from "@/lib/types";

const RISK_COLORS = { low: "#22c55e", medium: "#f59e0b", high: "#ef4444" };

const statConfig = [
  {
    key: "total_patients",
    title: "Total Patients",
    icon: Users,
    gradient: "from-blue-500 to-blue-600",
    shadow: "shadow-blue-500/20",
  },
  {
    key: "high_risk_count",
    title: "High Risk",
    icon: AlertTriangle,
    gradient: "from-red-500 to-rose-600",
    shadow: "shadow-red-500/20",
  },
  {
    key: "predictions_today",
    title: "Predictions Today",
    icon: Activity,
    gradient: "from-emerald-500 to-green-600",
    shadow: "shadow-emerald-500/20",
  },
  {
    key: "appointments_today",
    title: "Appointments Today",
    icon: Calendar,
    gradient: "from-amber-500 to-orange-600",
    shadow: "shadow-amber-500/20",
  },
] as const;

export default function DashboardPage() {
  const { token, user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiFetch<DashboardStats>("/api/dashboard/stats", { token: token! }),
    enabled: !!token,
  });

  const { data: riskDist } = useQuery({
    queryKey: ["risk-distribution"],
    queryFn: () =>
      apiFetch<Record<string, number>>("/api/dashboard/risk-distribution", { token: token! }),
    enabled: !!token,
  });

  const { data: predOverTime } = useQuery({
    queryKey: ["predictions-over-time"],
    queryFn: () =>
      apiFetch<{ date: string; count: number }[]>("/api/dashboard/predictions-over-time", { token: token! }),
    enabled: !!token,
  });

  const { data: districtRisk } = useQuery({
    queryKey: ["district-risk"],
    queryFn: () =>
      apiFetch<{ district: string; low: number; medium: number; high: number }[]>(
        "/api/dashboard/district-risk",
        { token: token! }
      ),
    enabled: !!token,
  });

  const { data: recentPatients } = useQuery({
    queryKey: ["recent-patients"],
    queryFn: () =>
      apiFetch<PatientList>("/api/patients?per_page=8", { token: token! }),
    enabled: !!token,
  });

  const pieData = riskDist
    ? Object.entries(riskDist).map(([name, value]) => ({ name, value }))
    : [];

  const totalRiskPatients = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.full_name}. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statConfig.map((cfg) => {
              const Icon = cfg.icon;
              const value = stats?.[cfg.key] ?? 0;
              return (
                <div
                  key={cfg.key}
                  className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{cfg.title}</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
                    </div>
                    <div className={`rounded-xl bg-gradient-to-br ${cfg.gradient} p-3 shadow-lg ${cfg.shadow}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-gray-50 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              );
            })}
      </div>

      {/* Charts row 1 */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Risk Distribution */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Risk Distribution</h2>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
              {totalRiskPatients} patients
            </span>
          </div>
          <p className="mb-4 text-xs text-gray-400">Based on latest prediction per patient</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={115}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={RISK_COLORS[entry.name as keyof typeof RISK_COLORS] || "#94a3b8"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-gray-400">
              No prediction data yet
            </div>
          )}
          {/* Legend */}
          <div className="mt-2 flex justify-center gap-6">
            {[
              { label: "Low", color: "bg-green-500" },
              { label: "Medium", color: "bg-amber-500" },
              { label: "High", color: "bg-red-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs text-gray-600">
                <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Predictions Over Time */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Predictions Over Time</h2>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </div>
          <p className="mb-4 text-xs text-gray-400">Last 30 days</p>
          {predOverTime && predOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={predOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#3b82f6" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-gray-400">
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* District Breakdown */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 lg:col-span-2">
          <h2 className="mb-1 text-base font-semibold text-gray-900">District-wise Risk</h2>
          <p className="mb-4 text-xs text-gray-400">Risk level distribution by district</p>
          {districtRisk && districtRisk.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={districtRisk}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="district" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                />
                <Legend />
                <Bar dataKey="low" fill={RISK_COLORS.low} name="Low" radius={[4, 4, 0, 0]} />
                <Bar dataKey="medium" fill={RISK_COLORS.medium} name="Medium" radius={[4, 4, 0, 0]} />
                <Bar dataKey="high" fill={RISK_COLORS.high} name="High" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[320px] items-center justify-center text-sm text-gray-400">
              No data yet
            </div>
          )}
        </div>

        {/* Recent Patients */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Recent Patients</h2>
            <Link
              href="/patients"
              className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentPatients?.patients.slice(0, 8).map((p) => (
              <Link
                key={p.id}
                href={`/patients/${p.id}`}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-gray-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{p.full_name}</p>
                  <p className="text-xs text-gray-400">{p.district}, {p.age}y</p>
                </div>
                <RiskBadge level={p.latest_risk_level} />
              </Link>
            )) || (
              <p className="py-8 text-center text-sm text-gray-400">No patients yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
