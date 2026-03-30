"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import NotificationBell from "@/components/NotificationBell";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <Sidebar />
      {/* Top bar */}
      <header className="fixed left-0 right-0 top-0 z-20 flex h-14 items-center justify-end border-b border-gray-100 bg-white/80 px-4 backdrop-blur-md lg:left-64 lg:px-6">
        <NotificationBell />
      </header>
      <main className="min-h-screen pt-14 lg:ml-64">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
