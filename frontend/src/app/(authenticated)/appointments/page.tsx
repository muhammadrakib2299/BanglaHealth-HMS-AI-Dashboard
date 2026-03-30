"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Check, X, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/Toast";
import type { Appointment } from "@/lib/types";
import { clsx } from "clsx";
import { TableRowSkeleton } from "@/components/Skeleton";

const statusStyles = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
};

function NewAppointmentForm({ onClose }: { onClose: () => void }) {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    notes: "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/appointments/", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          patient_id: Number(form.patient_id),
          doctor_id: Number(form.doctor_id),
        }),
        token: token!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast("Appointment scheduled", "success");
      onClose();
    },
    onError: (err: Error) => toast(err.message, "error"),
  });

  return (
    <div className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Schedule New Appointment
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Patient ID *
          </label>
          <input
            type="number"
            required
            value={form.patient_id}
            onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            placeholder="e.g. 1"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Doctor ID *
          </label>
          <input
            type="number"
            required
            value={form.doctor_id}
            onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            placeholder="e.g. 2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Date *
          </label>
          <input
            type="date"
            required
            value={form.appointment_date}
            onChange={(e) =>
              setForm({ ...form, appointment_date: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Time *
          </label>
          <input
            type="time"
            required
            value={form.appointment_time}
            onChange={(e) =>
              setForm({ ...form, appointment_time: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Notes
          </label>
          <input
            type="text"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            placeholder="Optional notes..."
          />
        </div>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {mutation.isPending ? "Scheduling..." : "Schedule"}
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

export default function AppointmentsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: () =>
      apiFetch<Appointment[]>("/api/appointments/", { token: token! }),
    enabled: !!token,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiFetch(`/api/appointments/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
        token: token!,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast(
        `Appointment ${variables.status}`,
        variables.status === "completed" ? "success" : "info"
      );
    },
    onError: (err: Error) => toast(err.message, "error"),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          New Appointment
        </button>
      </div>

      {showForm && <NewAppointmentForm onClose={() => setShowForm(false)} />}

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Patient ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Notes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={6} />
              ))
            ) : !appointments?.length ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  No appointments found
                </td>
              </tr>
            ) : (
              appointments.map((appt) => (
                <tr key={appt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{appt.appointment_date}</td>
                  <td className="px-6 py-4 text-sm">{appt.appointment_time}</td>
                  <td className="px-6 py-4 text-sm">#{appt.patient_id}</td>
                  <td className="px-6 py-4">
                    <span
                      className={clsx(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                        statusStyles[appt.status]
                      )}
                    >
                      {appt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {appt.notes || "---"}
                  </td>
                  <td className="px-6 py-4">
                    {appt.status === "scheduled" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            updateMutation.mutate({ id: appt.id, status: "completed" })
                          }
                          className="rounded bg-green-50 p-1 text-green-600 hover:bg-green-100"
                          title="Mark Complete"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            updateMutation.mutate({ id: appt.id, status: "cancelled" })
                          }
                          className="rounded bg-red-50 p-1 text-red-600 hover:bg-red-100"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
