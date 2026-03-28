"use client";

import { useEffect, useState, useCallback } from "react";
import DataTable, { Column } from "@/components/DataTable";
import Modal from "@/components/Modal";
import EntityForm, { FieldConfig } from "@/components/EntityForm";

const COLUMNS: Column[] = [
  { key: "Member", label: "Member" },
  { key: "Division", label: "Division" },
  { key: "Age Category", label: "Age Category" },
  { key: "Gender Category", label: "Gender Category" },
  { key: "Competition Status", label: "Competition Status", type: "status" },
  { key: "Qualification Level", label: "Qualification Level" },
];

const FORM_FIELDS: FieldConfig[] = [
  { name: "Member", label: "Member", type: "text", required: true },
  { name: "Club", label: "Club", type: "text" },
  { name: "Division", label: "Division", type: "select", required: true, options: ["Individual", "Team", "Adaptive"] },
  { name: "Age Category", label: "Age Category", type: "select", required: true, options: ["Teen (14-15)", "Junior (16-17)", "Open (18-34)", "Masters 35-39", "Masters 40-44", "Masters 45-49", "Masters 50-54", "Masters 55-59", "Masters 60+"] },
  { name: "Gender Category", label: "Gender Category", type: "select", required: true, options: ["Male", "Female", "Non-Binary"] },
  { name: "Competition Status", label: "Competition Status", type: "select", required: true, options: ["Active", "Inactive", "Banned"] },
  { name: "Qualification Level", label: "Qualification Level", type: "select", options: ["Regional", "Provincial", "National", "International"] },
  { name: "Notes", label: "Notes", type: "textarea" },
];

interface Record { id: string; fields: globalThis.Record<string, unknown>; }

export default function AthletesPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Record | null>(null);
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

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  async function handleSubmit(fields: globalThis.Record<string, unknown>) {
    try {
      const url = editing ? `/api/athletes/${editing.id}` : "/api/athletes";
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
    if (!confirm("Delete this athlete?")) return;
    try {
      const res = await fetch(`/api/athletes/${id}`, { method: "DELETE" });
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
        <h1 className="text-2xl font-bold">Athletes</h1>
        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
        >
          Add Athlete
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

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? "Edit Athlete" : "Add Athlete"}>
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
