"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Users,
  AlertTriangle,
  Activity,
  Calendar,
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
import type { DashboardStats } from "@/lib/types";

const RISK_COLORS = { low: "#22c55e", medium: "#f59e0b", high: "#ef4444" };

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { token } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiFetch<DashboardStats>("/api/dashboard/stats", { token: token! }),
    enabled: !!token,
  });

  const { data: riskDist } = useQuery({
    queryKey: ["risk-distribution"],
    queryFn: () =>
      apiFetch<Record<string, number>>("/api/dashboard/risk-distribution", {
        token: token!,
      }),
    enabled: !!token,
  });

  const { data: predOverTime } = useQuery({
    queryKey: ["predictions-over-time"],
    queryFn: () =>
      apiFetch<{ date: string; count: number }[]>(
        "/api/dashboard/predictions-over-time",
        { token: token! }
      ),
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

  const pieData = riskDist
    ? Object.entries(riskDist).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stat Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={stats?.total_patients ?? 0}
          icon={Users}
          color="bg-primary-600"
        />
        <StatCard
          title="High Risk"
          value={stats?.high_risk_count ?? 0}
          icon={AlertTriangle}
          color="bg-red-500"
        />
        <StatCard
          title="Predictions Today"
          value={stats?.predictions_today ?? 0}
          icon={Activity}
          color="bg-emerald-500"
        />
        <StatCard
          title="Appointments Today"
          value={stats?.appointments_today ?? 0}
          icon={Calendar}
          color="bg-amber-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Risk Distribution Pie */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Risk Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {pieData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={
                      RISK_COLORS[entry.name as keyof typeof RISK_COLORS] ||
                      "#94a3b8"
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Predictions Over Time */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Predictions Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={predOverTime || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* District Risk Breakdown */}
        <div className="col-span-1 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            District-wise Risk Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={districtRisk || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="district" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="low" fill={RISK_COLORS.low} name="Low Risk" />
              <Bar dataKey="medium" fill={RISK_COLORS.medium} name="Medium Risk" />
              <Bar dataKey="high" fill={RISK_COLORS.high} name="High Risk" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
