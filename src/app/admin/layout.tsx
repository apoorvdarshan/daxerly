"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/admin/check")
        .then((res) => res.json())
        .then((data) => {
          if (!data.admin) {
            router.replace("/dashboard");
          } else {
            setAuthorized(true);
          }
        })
        .catch(() => router.replace("/dashboard"))
        .finally(() => setChecking(false));
    }
  }, [status, router]);

  if (status === "loading" || checking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!authorized) return null;

  return <>{children}</>;
}
