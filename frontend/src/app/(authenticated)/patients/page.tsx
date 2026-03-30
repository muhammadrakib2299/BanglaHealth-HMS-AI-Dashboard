"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import RiskBadge from "@/components/RiskBadge";
import { TableRowSkeleton } from "@/components/Skeleton";
import type { PatientList } from "@/lib/types";

export default function PatientsPage() {
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [riskFilter, setRiskFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["patients", search, page, riskFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("per_page", "20");
      const query = params.toString();
      return apiFetch<PatientList>(`/api/patients?${query}`, { token: token! });
    },
    enabled: !!token,
  });

  const totalPages = data ? Math.ceil(data.total / data.per_page) : 0;

  // Client-side risk filter
  const filteredPatients = riskFilter
    ? data?.patients.filter(
        (p) => p.latest_risk_level?.toLowerCase() === riskFilter
      )
    : data?.patients;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <Link
          href="/patients/new"
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Add Patient
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or district..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
        >
          <option value="">All Risk Levels</option>
          <option value="high">High Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="low">Low Risk</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Age
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Gender
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                District
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Risk Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Registered
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={6} />
              ))
            ) : !filteredPatients?.length ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  No patients found
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => (
                <tr
                  key={patient.id}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/patients/${patient.id}`}
                      className="font-medium text-primary-600 hover:underline"
                    >
                      {patient.full_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {patient.age}
                  </td>
                  <td className="px-6 py-4 text-sm capitalize text-gray-600">
                    {patient.gender}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {patient.district}
                  </td>
                  <td className="px-6 py-4">
                    <RiskBadge level={patient.latest_risk_level} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(patient.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
            <p className="text-sm text-gray-500">
              {data?.total} patients total
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg p-1.5 hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg p-1.5 hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
