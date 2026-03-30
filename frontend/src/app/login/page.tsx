"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side — branding */}
      <div className="hidden w-1/2 items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 lg:flex">
        <div className="max-w-md px-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <Activity className="h-10 w-10 text-white" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-white">
            BanglaHealth HMS
          </h1>
          <p className="text-lg text-primary-100">
            AI-Powered Hospital Management System
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-left">
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold text-white">XGBoost</p>
              <p className="text-sm text-primary-200">Diabetes Risk + SHAP</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold text-white">ResNet-50</p>
              <p className="text-sm text-primary-200">Pneumonia X-Ray AI</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold text-white">50+</p>
              <p className="text-sm text-primary-200">Demo Patients</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold text-white">4 Roles</p>
              <p className="text-sm text-primary-200">RBAC System</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side — login form */}
      <div className="flex w-full items-center justify-center bg-gray-50 px-6 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-600">
              <Activity className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">BanglaHealth HMS</h1>
          </div>

          <div className="mb-8 hidden lg:block">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-1 text-gray-500">Sign in to your account</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white p-8 shadow-xl shadow-gray-200/50 ring-1 ring-gray-100"
          >
            {error && (
              <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                <div className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            {/* Email */}
            <div className="mb-5">
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="admin@banglahealth.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-12 text-sm transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:from-primary-700 hover:to-primary-800 hover:shadow-primary-500/30 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Demo credentials */}
            <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Demo Credentials
              </p>
              <div className="space-y-1.5 text-xs text-gray-500">
                <button
                  type="button"
                  onClick={() => { setEmail("admin@banglahealth.com"); setPassword("admin123"); }}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-white"
                >
                  <span><b className="text-gray-700">Admin</b> — admin@banglahealth.com</span>
                  <span className="text-primary-500">Use</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail("doctor@banglahealth.com"); setPassword("doctor123"); }}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-white"
                >
                  <span><b className="text-gray-700">Doctor</b> — doctor@banglahealth.com</span>
                  <span className="text-primary-500">Use</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail("nurse@banglahealth.com"); setPassword("nurse123"); }}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-white"
                >
                  <span><b className="text-gray-700">Nurse</b> — nurse@banglahealth.com</span>
                  <span className="text-primary-500">Use</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
