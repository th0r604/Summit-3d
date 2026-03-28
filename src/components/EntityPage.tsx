"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import DataTable, { Column } from "@/components/DataTable";
import Modal from "@/components/Modal";

interface Record {
  id: string;
  fields: globalThis.Record<string, unknown>;
}

interface Props {
  title: string;
  apiPath: string;
  columns?: Column[];
}

export default function EntityPage({ title, apiPath, columns: fixedColumns }: Props) {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Record | null>(null);
  const [formData, setFormData] = useState<string>("{}");

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/${apiPath}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRecords(data.records);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [apiPath]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  // Auto-discover columns from the first record if no fixed columns
  const columns = useMemo(() => {
    if (fixedColumns) return fixedColumns;
    if (records.length === 0) return [];
    const keys = Object.keys(records[0].fields).slice(0, 6);
    return keys.map((key): Column => ({
      key,
      label: key,
      type: key.toLowerCase().includes("status") ? "status"
        : key.toLowerCase().includes("date") ? "date"
        : "text",
    }));
  }, [fixedColumns, records]);

  async function handleSubmit() {
    try {
      const fields = JSON.parse(formData);
      const url = editing ? `/api/${apiPath}/${editing.id}` : `/api/${apiPath}`;
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details?.join(", "));
      setModalOpen(false);
      setEditing(null);
      setFormData("{}");
      fetchRecords();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(`Delete this ${title.slice(0, -1).toLowerCase()} record?`)) return;
    try {
      const res = await fetch(`/api/${apiPath}/${id}`, { method: "DELETE" });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error); }
      fetchRecords();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  function handleEdit(id: string) {
    const record = records.find((r) => r.id === id);
    if (record) {
      setEditing(record);
      setFormData(JSON.stringify(record.fields, null, 2));
      setModalOpen(true);
    }
  }

  function openCreate() {
    setEditing(null);
    setFormData("{}");
    setModalOpen(true);
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex gap-3">
          <button
            onClick={fetchRecords}
            className="text-sm text-blue-600 hover:underline"
          >
            Refresh
          </button>
          <button
            onClick={openCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
          >
            Add Record
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-3 underline">Dismiss</button>
        </div>
      )}

      <div className="bg-white rounded-lg border">
        <DataTable
          columns={columns}
          data={records}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? `Edit ${title}` : `Add ${title}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Enter the fields as JSON. Field names must match your Airtable column names exactly.
          </p>
          <textarea
            value={formData}
            onChange={(e) => setFormData(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm h-48 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {editing ? "Update" : "Create"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
