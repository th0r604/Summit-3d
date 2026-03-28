"use client";

import { useState, useEffect, useCallback } from "react";
import StatusBadge from "@/components/StatusBadge";

interface SyncRecord {
  id: string;
  type: string;
  name: string;
  syncedAt: string | null;
  status: string;
}

export default function IF3SyncPage() {
  const [records, setRecords] = useState<SyncRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/if3-sync");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRecords(data.records);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function triggerSync() {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch("/api/if3-sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  const pending = records.filter((r) => r.status === "pending").length;
  const synced = records.filter((r) => r.status === "synced").length;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">IF3 Sync</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sync championship events and TO certifications to the International Federation
          </p>
        </div>
        <button
          onClick={triggerSync}
          disabled={syncing || pending === 0}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm"
        >
          {syncing ? "Syncing..." : `Sync ${pending} Pending`}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-3 underline">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{records.length}</p>
          <p className="text-sm text-gray-500">Total</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{pending}</p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{synced}</p>
          <p className="text-sm text-gray-500">Synced</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border p-5">
          <h3 className="font-semibold mb-2">Championship Events</h3>
          <p className="text-sm text-gray-500">National championship competitions appear on the IF3 international calendar.</p>
        </div>
        <div className="bg-white rounded-lg border p-5">
          <h3 className="font-semibold mb-2">TO Certifications</h3>
          <p className="text-sm text-gray-500">Level 2+ certifications are recognized internationally through IF3.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Sync Queue</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">No records to sync.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">{r.type}</span>
                  </td>
                  <td className="py-3 px-4">{r.name}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={r.status === "synced" ? "Completed" : "Pending"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-sm text-blue-800">
        <p className="font-medium mb-1">Setup</p>
        <p>Add <code className="bg-blue-100 px-1 rounded">IF3_BASE_ID</code> to your <code className="bg-blue-100 px-1 rounded">.env.local</code> to enable syncing to the IF3 master database.</p>
      </div>
    </div>
  );
}
