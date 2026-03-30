"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/Toast";
import type { Patient } from "@/lib/types";

const DISTRICTS = [
  "Dhaka", "Chittagong", "Rajshahi", "Khulna", "Sylhet",
  "Rangpur", "Barisal", "Mymensingh", "Comilla", "Gazipur",
  "Narayanganj", "Tangail", "Bogura", "Cox's Bazar", "Jessore",
];

export default function NewPatientPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    age: "",
    gender: "male",
    district: DISTRICTS[0],
    phone: "",
    address: "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch<Patient>("/api/patients/", {
        method: "POST",
        body: JSON.stringify({ ...form, age: Number(form.age) }),
        token: token!,
      }),
    onSuccess: (data) => {
      toast("Patient registered successfully", "success");
      router.push(`/patients/${data.id}`);
    },
    onError: (err: Error) => toast(err.message, "error"),
  });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/patients" className="rounded-xl p-2 transition-colors hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Patient</h1>
          <p className="mt-0.5 text-sm text-gray-500">Register a new patient record</p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Full Name *</label>
            <input
              type="text"
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="Enter patient's full name"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Age *</label>
            <input
              type="number"
              required
              min={0}
              max={120}
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Gender *</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">District *</label>
            <select
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="+880..."
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Address</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={2}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="Full address..."
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Link
            href="/patients"
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition-all hover:shadow-primary-500/30 disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            {mutation.isPending ? "Creating..." : "Create Patient"}
          </button>
        </div>
      </form>
    </div>
  );
}
