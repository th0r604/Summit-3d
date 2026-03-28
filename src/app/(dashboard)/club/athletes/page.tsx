"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import DataTable, { Column } from "@/components/DataTable";

const COLUMNS: Column[] = [
  { key: "Name", label: "Name" },
  { key: "Division", label: "Division" },
  { key: "Age Category", label: "Age Category" },
  { key: "Gender Category", label: "Gender" },
  { key: "Competition Status", label: "Status", type: "status" },
];

interface Record {
  id: string;
  fields: globalThis.Record<string, unknown>;
}

export default function ClubAthletesPage() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/athletes");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRecords(data.records);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (session) fetchRecords(); }, [session, fetchRecords]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Club Athletes</h1>
          <p className="text-sm text-gray-500 mt-1">{records.length} athlete{records.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={fetchRecords} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-lg border">
        <DataTable columns={COLUMNS} data={records} loading={loading} />
      </div>
    </div>
  );
}
