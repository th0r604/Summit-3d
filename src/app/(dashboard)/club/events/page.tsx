"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";

const COLUMNS: Column[] = [
  { key: "Event Name", label: "Event" },
  { key: "Event Type", label: "Type" },
  { key: "Start Date", label: "Start Date", type: "date" },
  { key: "Location", label: "Location" },
  { key: "Status", label: "Status", type: "status" },
];

interface Record {
  id: string;
  fields: globalThis.Record<string, unknown>;
}

export default function ClubEventsPage() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
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
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-sm text-gray-500 mt-1">{records.length} event{records.length !== 1 ? "s" : ""}</p>
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
