"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Search, Plus, ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
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

  const filteredPatients = riskFilter
    ? data?.patients.filter((p) => p.latest_risk_level?.toLowerCase() === riskFilter)
    : data?.patients;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="mt-1 text-sm text-gray-500">
            {data?.total ?? 0} patients registered
          </p>
        </div>
        <Link
          href="/patients/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition-all hover:shadow-primary-500/30"
        >
          <UserPlus className="h-4 w-4" />
          Add Patient
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or district..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">All Risk Levels</option>
          <option value="high">High Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="low">Low Risk</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Patient
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Age
                </th>
                <th className="hidden px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 sm:table-cell">
                  Gender
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  District
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Risk Level
                </th>
                <th className="hidden px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 lg:table-cell">
                  Registered
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={6} />
                ))
              ) : !filteredPatients?.length ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <p className="text-sm text-gray-400">No patients found</p>
                    <p className="mt-1 text-xs text-gray-300">Try adjusting your search or filter</p>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="group transition-colors hover:bg-primary-50/30"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/patients/${patient.id}`}
                        className="flex items-center gap-3"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-xs font-bold text-primary-700">
                          {patient.full_name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-gray-900 group-hover:text-primary-700">
                          {patient.full_name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{patient.age}</td>
                    <td className="hidden px-6 py-4 text-sm capitalize text-gray-600 sm:table-cell">
                      {patient.gender}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{patient.district}</td>
                    <td className="px-6 py-4">
                      <RiskBadge level={patient.latest_risk_level} />
                    </td>
                    <td className="hidden px-6 py-4 text-sm text-gray-400 lg:table-cell">
                      {new Date(patient.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
            <p className="text-sm text-gray-500">{data?.total} patients total</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-200 p-2 transition-colors hover:bg-gray-50 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[80px] text-center text-sm font-medium text-gray-700">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-gray-200 p-2 transition-colors hover:bg-gray-50 disabled:opacity-30"
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
