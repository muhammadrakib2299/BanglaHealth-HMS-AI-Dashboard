"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Activity,
  Brain,
  TrendingUp,
  Scan,
  FileDown,
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
  LineChart,
  Line,
  Legend,
} from "recharts";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import RiskBadge from "@/components/RiskBadge";
import XRayUploader from "@/components/XRayUploader";
import { useToast } from "@/components/Toast";
import { Skeleton } from "@/components/Skeleton";
import type { Patient, Vitals, Prediction } from "@/lib/types";

function VitalsForm({
  patientId,
  onSuccess,
}: {
  patientId: number;
  onSuccess: () => void;
}) {
  const { token } = useAuth();
  const { toast } = useToast();
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
      toast("Vitals recorded successfully", "success");
      onSuccess();
    },
    onError: (err: Error) => toast(err.message, "error"),
  });

  const fields = [
    { key: "pregnancies", label: "Pregnancies", step: 1 },
    { key: "glucose", label: "Glucose (mg/dL)", step: 0.1 },
    { key: "blood_pressure", label: "Blood Pressure (mm Hg)", step: 0.1 },
    { key: "skin_thickness", label: "Skin Thickness (mm)", step: 0.1 },
    { key: "insulin", label: "Insulin (mu U/ml)", step: 0.1 },
    { key: "bmi", label: "BMI", step: 0.1 },
    { key: "diabetes_pedigree", label: "Diabetes Pedigree", step: 0.001 },
    { key: "age", label: "Age", step: 1 },
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
            type="number"
            step={f.step}
            value={form[f.key]}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, [f.key]: Number(e.target.value) }))
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
        <Tooltip formatter={(value: number) => [Math.abs(value).toFixed(4), "Impact"]} />
        <Bar dataKey="value" name="Impact">
          {data.map((d, i) => (
            <Cell key={i} fill={d.value > 0 ? "#ef4444" : "#22c55e"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function VitalsHistoryChart({ vitals }: { vitals: Vitals[] }) {
  const chartData = [...vitals]
    .reverse()
    .map((v) => ({
      date: new Date(v.recorded_at).toLocaleDateString(),
      Glucose: v.glucose,
      BMI: v.bmi,
      "Blood Pressure": v.blood_pressure,
    }));

  if (chartData.length < 2) return null;

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Vitals Trend
      </h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Glucose" stroke="#3b82f6" strokeWidth={2} />
          <Line type="monotone" dataKey="BMI" stroke="#f59e0b" strokeWidth={2} />
          <Line type="monotone" dataKey="Blood Pressure" stroke="#ef4444" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function PatientDetailPage() {
  const { id } = useParams();
  const patientId = Number(id);
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"prediction" | "xray">("prediction");
  const [downloadingReport, setDownloadingReport] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleDownloadReport = async () => {
    if (!token) return;
    setDownloadingReport(true);
    try {
      const res = await fetch(`${API_URL}/api/patients/${patientId}/report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: "Download failed" }));
        throw new Error(error.detail || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `patient_${patientId}_report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast("Report downloaded", "success");
    } catch (err: any) {
      toast(err.message || "Failed to download report", "error");
    } finally {
      setDownloadingReport(false);
    }
  };

  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => apiFetch<Patient>(`/api/patients/${patientId}`, { token: token! }),
    enabled: !!token,
  });

  const { data: vitals } = useQuery({
    queryKey: ["vitals", patientId],
    queryFn: () => apiFetch<Vitals[]>(`/api/patients/${patientId}/vitals/`, { token: token! }),
    enabled: !!token,
  });

  const { data: predictions } = useQuery({
    queryKey: ["predictions", patientId],
    queryFn: () =>
      apiFetch<Prediction[]>(`/api/patients/${patientId}/predictions`, { token: token! }),
    enabled: !!token,
  });

  const predictMutation = useMutation({
    mutationFn: () =>
      apiFetch<Prediction>(`/api/patients/${patientId}/predict`, {
        method: "POST",
        token: token!,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["predictions", patientId] });
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      toast(
        `Risk prediction: ${data.risk_level.toUpperCase()} (${(data.risk_score * 100).toFixed(1)}%)`,
        data.risk_level === "high" ? "error" : "success"
      );
    },
    onError: (err: Error) => toast(err.message, "error"),
  });

  const latestPrediction = predictions?.[0];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Link href="/patients" className="rounded-lg p-2 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          {patientLoading ? (
            <Skeleton className="h-7 w-48" />
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900">
                {patient?.full_name}
              </h1>
              <p className="text-sm text-gray-500">
                {patient?.age} years, {patient?.gender} | {patient?.district}
                {patient?.phone && ` | ${patient.phone}`}
              </p>
            </>
          )}
        </div>
        {patient && (
          <button
            onClick={handleDownloadReport}
            disabled={downloadingReport}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <FileDown className="h-4 w-4" />
            {downloadingReport ? "Generating..." : "Download Report"}
          </button>
        )}
        {patient && <RiskBadge level={patient.latest_risk_level} />}
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
                <div key={v.id} className="rounded-lg bg-gray-50 p-3 text-sm">
                  <p className="mb-1 text-xs text-gray-400">
                    {new Date(v.recorded_at).toLocaleString()}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                    <span>Glucose: <b>{v.glucose}</b></span>
                    <span>BP: <b>{v.blood_pressure}</b></span>
                    <span>BMI: <b>{v.bmi}</b></span>
                    <span>Insulin: <b>{v.insulin}</b></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No vitals recorded yet</p>
          )}
        </div>

        {/* AI Section — Tabs: Prediction / X-Ray */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="mb-4 flex items-center gap-4 border-b border-gray-200 pb-3">
            <button
              onClick={() => setActiveTab("prediction")}
              className={`flex items-center gap-2 border-b-2 pb-1 text-sm font-medium transition-colors ${
                activeTab === "prediction"
                  ? "border-primary-600 text-primary-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Brain className="h-4 w-4" />
              Risk Prediction
            </button>
            <button
              onClick={() => setActiveTab("xray")}
              className={`flex items-center gap-2 border-b-2 pb-1 text-sm font-medium transition-colors ${
                activeTab === "xray"
                  ? "border-primary-600 text-primary-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Scan className="h-4 w-4" />
              X-Ray Analysis
            </button>
          </div>

          {activeTab === "prediction" && (
            <div>
              <div className="mb-4 flex justify-end">
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

              {predictions && predictions.length > 1 && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-700">
                    <TrendingUp className="h-4 w-4" />
                    Prediction History
                  </h3>
                  <div className="space-y-2">
                    {predictions.slice(1, 6).map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-sm">
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

              {!latestPrediction && !predictMutation.isPending && (
                <p className="py-8 text-center text-sm text-gray-400">
                  Record vitals and run a prediction to see results
                </p>
              )}
            </div>
          )}

          {activeTab === "xray" && <XRayUploader patientId={patientId} />}
        </div>
      </div>

      {/* Vitals Trend Chart */}
      {vitals && vitals.length >= 2 && (
        <div className="mt-6">
          <VitalsHistoryChart vitals={vitals} />
        </div>
      )}
    </div>
  );
}
