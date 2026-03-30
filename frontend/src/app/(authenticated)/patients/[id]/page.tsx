"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Activity,
  Brain,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import RiskBadge from "@/components/RiskBadge";
import type { Patient, Vitals, Prediction } from "@/lib/types";

function VitalsForm({
  patientId,
  onSuccess,
}: {
  patientId: number;
  onSuccess: () => void;
}) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    pregnancies: 0,
    glucose: 120,
    blood_pressure: 80,
    skin_thickness: 20,
    insulin: 80,
    bmi: 25,
    diabetes_pedigree: 0.5,
    age: 30,
  });

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/patients/${patientId}/vitals/`, {
        method: "POST",
        body: JSON.stringify(form),
        token: token!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vitals", patientId] });
      onSuccess();
    },
  });

  const fields = [
    { key: "pregnancies", label: "Pregnancies", type: "number", step: 1 },
    { key: "glucose", label: "Glucose (mg/dL)", type: "number", step: 0.1 },
    { key: "blood_pressure", label: "Blood Pressure (mm Hg)", type: "number", step: 0.1 },
    { key: "skin_thickness", label: "Skin Thickness (mm)", type: "number", step: 0.1 },
    { key: "insulin", label: "Insulin (mu U/ml)", type: "number", step: 0.1 },
    { key: "bmi", label: "BMI", type: "number", step: 0.1 },
    { key: "diabetes_pedigree", label: "Diabetes Pedigree", type: "number", step: 0.001 },
    { key: "age", label: "Age", type: "number", step: 1 },
  ] as const;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="grid grid-cols-2 gap-3"
    >
      {fields.map((f) => (
        <div key={f.key}>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            {f.label}
          </label>
          <input
            type={f.type}
            step={f.step}
            value={form[f.key]}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                [f.key]: Number(e.target.value),
              }))
            }
            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>
      ))}
      <div className="col-span-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-lg bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {mutation.isPending ? "Saving..." : "Record Vitals"}
        </button>
      </div>
    </form>
  );
}

function SHAPChart({ features }: { features: Prediction["top_features"] }) {
  const data = features.map((f) => ({
    ...f,
    value: f.direction.includes("increases") ? f.impact : -f.impact,
  }));

  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="feature" width={120} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value: number) => [Math.abs(value).toFixed(4), "Impact"]}
        />
        <Bar dataKey="value" name="Impact">
          {data.map((d, i) => (
            <Cell key={i} fill={d.value > 0 ? "#ef4444" : "#22c55e"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function PatientDetailPage() {
  const { id } = useParams();
  const patientId = Number(id);
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [showVitalsForm, setShowVitalsForm] = useState(false);

  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () =>
      apiFetch<Patient>(`/api/patients/${patientId}`, { token: token! }),
    enabled: !!token,
  });

  const { data: vitals } = useQuery({
    queryKey: ["vitals", patientId],
    queryFn: () =>
      apiFetch<Vitals[]>(`/api/patients/${patientId}/vitals/`, { token: token! }),
    enabled: !!token,
  });

  const { data: predictions } = useQuery({
    queryKey: ["predictions", patientId],
    queryFn: () =>
      apiFetch<Prediction[]>(`/api/patients/${patientId}/predictions`, {
        token: token!,
      }),
    enabled: !!token,
  });

  const predictMutation = useMutation({
    mutationFn: () =>
      apiFetch<Prediction>(`/api/patients/${patientId}/predict`, {
        method: "POST",
        token: token!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictions", patientId] });
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
    },
  });

  const latestPrediction = predictions?.[0];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/patients"
          className="rounded-lg p-2 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {patient?.full_name || "Loading..."}
          </h1>
          <p className="text-sm text-gray-500">
            {patient?.age} years, {patient?.gender} | {patient?.district}
          </p>
        </div>
        {patient && (
          <RiskBadge level={patient.latest_risk_level} />
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Vitals Section */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Activity className="h-5 w-5 text-primary-600" />
              Vitals
            </h2>
            <button
              onClick={() => setShowVitalsForm(!showVitalsForm)}
              className="text-sm font-medium text-primary-600 hover:underline"
            >
              {showVitalsForm ? "Cancel" : "+ Record Vitals"}
            </button>
          </div>

          {showVitalsForm && (
            <div className="mb-4 rounded-lg bg-gray-50 p-4">
              <VitalsForm
                patientId={patientId}
                onSuccess={() => setShowVitalsForm(false)}
              />
            </div>
          )}

          {vitals?.length ? (
            <div className="space-y-3">
              {vitals.slice(0, 5).map((v) => (
                <div
                  key={v.id}
                  className="rounded-lg bg-gray-50 p-3 text-sm"
                >
                  <p className="mb-1 text-xs text-gray-400">
                    {new Date(v.recorded_at).toLocaleString()}
                  </p>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <span>Glucose: {v.glucose}</span>
                    <span>BP: {v.blood_pressure}</span>
                    <span>BMI: {v.bmi}</span>
                    <span>Insulin: {v.insulin}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No vitals recorded yet</p>
          )}
        </div>

        {/* Prediction Section */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Brain className="h-5 w-5 text-primary-600" />
              Risk Prediction
            </h2>
            <button
              onClick={() => predictMutation.mutate()}
              disabled={predictMutation.isPending}
              className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {predictMutation.isPending ? "Running..." : "Run Prediction"}
            </button>
          </div>

          {predictMutation.isError && (
            <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {(predictMutation.error as Error).message}
            </div>
          )}

          {latestPrediction && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
                <div>
                  <p className="text-sm text-gray-500">Risk Score</p>
                  <p className="text-2xl font-bold">
                    {(latestPrediction.risk_score * 100).toFixed(1)}%
                  </p>
                </div>
                <RiskBadge level={latestPrediction.risk_level} />
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-700">
                  SHAP Explanation — Top Contributing Factors
                </h3>
                <SHAPChart features={latestPrediction.top_features} />
              </div>
            </div>
          )}

          {/* Prediction History */}
          {predictions && predictions.length > 1 && (
            <div className="mt-4 border-t pt-4">
              <h3 className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-700">
                <TrendingUp className="h-4 w-4" />
                Prediction History
              </h3>
              <div className="space-y-2">
                {predictions.slice(1, 6).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-500">
                      {new Date(p.predicted_at).toLocaleDateString()}
                    </span>
                    <span className="font-medium">
                      {(p.risk_score * 100).toFixed(1)}%
                    </span>
                    <RiskBadge level={p.risk_level} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
