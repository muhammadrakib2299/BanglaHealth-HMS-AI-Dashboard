"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, Image, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiFetch, apiUpload } from "@/lib/api";
import { useToast } from "@/components/Toast";
import type { XrayResult } from "@/lib/types";
import { clsx } from "clsx";

export default function XRayUploader({ patientId }: { patientId: number }) {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dragOver, setDragOver] = useState(false);

  const { data: xrayHistory } = useQuery({
    queryKey: ["xrays", patientId],
    queryFn: () =>
      apiFetch<XrayResult[]>(`/api/patients/${patientId}/xray/history`, {
        token: token!,
      }).catch(() => [] as XrayResult[]),
    enabled: !!token,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiUpload<XrayResult>(
        `/api/patients/${patientId}/xray/`,
        formData,
        token!
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["xrays", patientId] });
      toast(
        `X-Ray analyzed — Pneumonia probability: ${(data.pneumonia_probability * 100).toFixed(1)}%`,
        data.pneumonia_probability > 0.5 ? "error" : "success"
      );
    },
    onError: (err: Error) => {
      toast(err.message, "error");
    },
  });

  const handleFile = useCallback(
    (file: File) => {
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        toast("Only JPEG/PNG files are allowed", "error");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast("File size must be under 10MB", "error");
        return;
      }
      uploadMutation.mutate(file);
    },
    [uploadMutation, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const latestResult = uploadMutation.data;

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={clsx(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          dragOver
            ? "border-primary-400 bg-primary-50"
            : "border-gray-300 hover:border-gray-400",
          uploadMutation.isPending && "pointer-events-none opacity-60"
        )}
      >
        <Upload className="mb-3 h-8 w-8 text-gray-400" />
        <p className="mb-1 text-sm font-medium text-gray-700">
          {uploadMutation.isPending
            ? "Analyzing X-Ray..."
            : "Drag & drop a chest X-ray here"}
        </p>
        <p className="mb-3 text-xs text-gray-400">JPEG or PNG, max 10MB</p>
        <label className="cursor-pointer rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          Select File
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {/* Loading bar */}
      {uploadMutation.isPending && (
        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full animate-pulse rounded-full bg-primary-500" style={{ width: "70%" }} />
        </div>
      )}

      {/* Latest result */}
      {latestResult && (
        <div className="rounded-lg bg-gray-50 p-4">
          <h4 className="mb-2 text-sm font-medium text-gray-700">
            Analysis Result
          </h4>
          <div className="flex items-center gap-3">
            {latestResult.pneumonia_probability > 0.5 ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>Pneumonia Probability</span>
                <span className="font-bold">
                  {(latestResult.pneumonia_probability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
                <div
                  className={clsx(
                    "h-full rounded-full transition-all",
                    latestResult.pneumonia_probability > 0.5
                      ? "bg-red-500"
                      : "bg-green-500"
                  )}
                  style={{
                    width: `${latestResult.pneumonia_probability * 100}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Confidence: {(latestResult.confidence * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* X-Ray history */}
      {xrayHistory && xrayHistory.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">
            X-Ray History
          </h4>
          <div className="space-y-2">
            {xrayHistory.map((xr) => (
              <div
                key={xr.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">
                    {new Date(xr.uploaded_at).toLocaleDateString()}
                  </span>
                </div>
                <span
                  className={clsx(
                    "font-medium",
                    xr.pneumonia_probability > 0.5
                      ? "text-red-600"
                      : "text-green-600"
                  )}
                >
                  {(xr.pneumonia_probability * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
