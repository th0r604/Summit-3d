"use client";

import { useEffect, useState, useCallback } from "react";
import DataTable, { Column } from "@/components/DataTable";
import Modal from "@/components/Modal";
import EntityForm, { FieldConfig } from "@/components/EntityForm";

const COLUMNS: Column[] = [
  { key: "Club Name", label: "Club Name" },
  { key: "Affiliate Number", label: "Affiliate Number" },
  { key: "City", label: "City" },
  { key: "Province", label: "Province" },
  { key: "Affiliation Status", label: "Affiliation Status", type: "status" },
  { key: "Contact Name", label: "Contact Name" },
];

const FORM_FIELDS: FieldConfig[] = [
  { name: "Club Name", label: "Club Name", type: "text", required: true },
  { name: "Affiliate Number", label: "Affiliate Number", type: "text" },
  { name: "Province", label: "Province", type: "select", options: ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"] },
  { name: "City", label: "City", type: "text" },
  { name: "Address", label: "Address", type: "textarea" },
  { name: "Contact Name", label: "Contact Name", type: "text" },
  { name: "Contact Email", label: "Contact Email", type: "email" },
  { name: "Contact Phone", label: "Contact Phone", type: "phone" },
  { name: "Website", label: "Website", type: "text" },
  { name: "Affiliation Status", label: "Affiliation Status", type: "select", required: true, options: ["Active", "Expired", "Pending"] },
  { name: "Affiliation Date", label: "Affiliation Date", type: "date" },
  { name: "Notes", label: "Notes", type: "textarea" },
];

interface Record { id: string; fields: globalThis.Record<string, unknown>; }

export default function ClubsPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Record | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clubs");
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

  async function handleSubmit(fields: globalThis.Record<string, unknown>) {
    try {
      const url = editing ? `/api/clubs/${editing.id}` : "/api/clubs";
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
      fetchRecords();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this club?")) return;
    try {
      const res = await fetch(`/api/clubs/${id}`, { method: "DELETE" });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error); }
      fetchRecords();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  function handleEdit(id: string) {
    const record = records.find((r) => r.id === id);
    if (record) { setEditing(record); setModalOpen(true); }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clubs</h1>
        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
        >
          Add Club
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-3 underline">Dismiss</button>
        </div>
      )}

      <div className="bg-white rounded-lg border">
        <DataTable
          columns={COLUMNS}
          data={records}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? "Edit Club" : "Add Club"}>
        <EntityForm
          fields={FORM_FIELDS}
          initialValues={editing?.fields}
          onSubmit={handleSubmit}
          submitLabel={editing ? "Update" : "Create"}
        />
      </Modal>
    </div>
  );
}
