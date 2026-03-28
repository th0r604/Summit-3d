"use client";

import { useEffect, useState, useCallback } from "react";
import DataTable, { Column } from "@/components/DataTable";

const COLUMNS: Column[] = [
  { key: "Name", label: "Name" },
  { key: "Certification Level", label: "Level" },
  { key: "Certification Status", label: "Status", type: "status" },
  { key: "Certification Date", label: "Certified", type: "date" },
  { key: "Certification Expiry", label: "Expiry", type: "date" },
];

interface Record {
  id: string;
  fields: globalThis.Record<string, unknown>;
}

export default function InternationalOfficialsPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/technical-officials");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRecords(data.records);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">International Technical Officials</h1>
          <p className="text-sm text-gray-500 mt-1">Officials across all national federations</p>
        </div>
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
