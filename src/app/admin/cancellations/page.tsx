"use client";

import { useEffect, useState } from "react";

interface Cancellation {
  email: string;
  name: string | null;
  cancelReason: string | null;
  cancelledAt: string | null;
}

export default function AdminCancellationsPage() {
  const [cancellations, setCancellations] = useState<Cancellation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/cancellations")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then(setCancellations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Subscription Cancellations</h1>

        {cancellations.length === 0 ? (
          <p className="text-gray-500">No cancellations yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 text-gray-400 text-left">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Cancelled At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {cancellations.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-900/50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{c.name || "—"}</div>
                      <div className="text-gray-500 text-xs">{c.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {c.cancelReason || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {c.cancelledAt
                        ? new Date(c.cancelledAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs text-gray-600">
          Total: {cancellations.length} cancellation{cancellations.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
