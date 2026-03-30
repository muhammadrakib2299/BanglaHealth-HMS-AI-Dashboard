"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Stethoscope,
  Mail,
  UserCheck,
  UserX,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { TableRowSkeleton } from "@/components/Skeleton";
import type { Doctor } from "@/lib/types";
import { clsx } from "clsx";

function DoctorForm({
  doctor,
  onClose,
}: {
  doctor?: Doctor;
  onClose: () => void;
}) {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!doctor;

  const [form, setForm] = useState({
    full_name: doctor?.full_name ?? "",
    email: doctor?.email ?? "",
    password: "",
    is_active: doctor?.is_active ?? true,
  });

  const mutation = useMutation({
    mutationFn: () => {
      if (isEditing) {
        const { password, ...updateData } = form;
        return apiFetch(`/api/doctors/${doctor.id}`, {
          method: "PUT",
          body: JSON.stringify({
            full_name: updateData.full_name,
            email: updateData.email,
            is_active: updateData.is_active,
          }),
          token: token!,
        });
      }
      return apiFetch("/api/doctors/", {
        method: "POST",
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          password: form.password,
        }),
        token: token!,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast(
        isEditing ? "Doctor updated" : "Doctor added",
        "success"
      );
      onClose();
    },
    onError: (err: Error) => toast(err.message, "error"),
  });

  return (
    <div className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {isEditing ? "Edit Doctor" : "Add New Doctor"}
        </h2>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            placeholder="Dr. Ahmed Khan"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            placeholder="doctor@hospital.com"
          />
        </div>
        {!isEditing && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password *
            </label>
            <input
              type="password"
              required={!isEditing}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="Min 6 characters"
            />
          </div>
        )}
        {isEditing && (
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              Active
            </label>
          </div>
        )}
        <div className="flex items-end gap-2 sm:col-span-2">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {mutation.isPending
              ? "Saving..."
              : isEditing
                ? "Update Doctor"
                : "Add Doctor"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function DoctorsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | undefined>();
  const [search, setSearch] = useState("");

  const { data: doctors, isLoading } = useQuery({
    queryKey: ["doctors", search],
    queryFn: () => {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      return apiFetch<Doctor[]>(`/api/doctors/${params}`, { token: token! });
    },
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/doctors/${id}`, { method: "DELETE", token: token! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast("Doctor removed", "success");
    },
    onError: (err: Error) => toast(err.message, "error"),
  });

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setShowForm(true);
  };

  const handleDelete = (doctor: Doctor) => {
    if (confirm(`Remove Dr. ${doctor.full_name}? This cannot be undone.`)) {
      deleteMutation.mutate(doctor.id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingDoctor(undefined);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
          <p className="mt-1 text-sm text-gray-500">
            {doctors?.length ?? 0} doctors registered
          </p>
        </div>
        <button
          onClick={() => {
            setEditingDoctor(undefined);
            setShowForm(!showForm);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition-all hover:shadow-primary-500/30"
        >
          <Plus className="h-4 w-4" />
          Add Doctor
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <DoctorForm doctor={editingDoctor} onClose={handleCloseForm} />
      )}

      {/* Search */}
      <div className="mb-5">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search doctors..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Doctor
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="hidden px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 lg:table-cell">
                  Joined
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={5} />
                ))
              ) : !doctors?.length ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Stethoscope className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                    <p className="text-sm text-gray-400">No doctors found</p>
                    <p className="mt-1 text-xs text-gray-300">
                      Add a doctor to get started
                    </p>
                  </td>
                </tr>
              ) : (
                doctors.map((doctor) => (
                  <tr
                    key={doctor.id}
                    className="group transition-colors hover:bg-primary-50/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-xs font-bold text-blue-700">
                          {doctor.full_name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {doctor.full_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        {doctor.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {doctor.is_active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                          <UserCheck className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
                          <UserX className="h-3 w-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="hidden px-6 py-4 text-sm text-gray-400 lg:table-cell">
                      {new Date(doctor.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(doctor)}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doctor)}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
