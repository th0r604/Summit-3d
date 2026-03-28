"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import DataTable, { Column } from "@/components/DataTable";
import Modal from "@/components/Modal";

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

interface FieldSchema {
  name: string;
  type: "text" | "email" | "number" | "date" | "boolean" | "select" | "multiline" | "array" | "url";
  options?: string[];
  sample?: unknown;
}

interface Props {
  title: string;
  apiPath: string;
  columns?: Column[];
}

export default function EntityPage({ title, apiPath, columns: fixedColumns }: Props) {
  const [records, setRecords] = useState<AirtableRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AirtableRecord | null>(null);
  const [schema, setSchema] = useState<FieldSchema[]>([]);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonData, setJsonData] = useState("{}");

  // Fetch schema on mount
  useEffect(() => {
    fetch(`/api/schema/${apiPath}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.fields?.length > 0) {
          setSchema(data.fields);
        }
      })
      .catch(() => {
        // Schema discovery failed — will use JSON fallback
      });
  }, [apiPath]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
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

  // Auto-discover columns from schema or records
  const columns = useMemo(() => {
    if (fixedColumns) return fixedColumns;

    if (schema.length > 0) {
      return schema.slice(0, 7).map((f): Column => ({
        key: f.name,
        label: f.name,
        type: f.type === "date" ? "date"
          : f.type === "number" ? "number"
          : f.type === "select" ? "status"
          : "text",
      }));
    }

    if (records.length === 0) return [];
    const keys = Object.keys(records[0].fields).slice(0, 6);
    return keys.map((key): Column => ({
      key,
      label: key,
      type: key.toLowerCase().includes("status") ? "status"
        : key.toLowerCase().includes("date") ? "date"
        : "text",
    }));
  }, [fixedColumns, schema, records]);

  // Filter records by search
  const filtered = useMemo(() => {
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter((r) =>
      Object.values(r.fields).some((v) =>
        v !== null && v !== undefined && String(v).toLowerCase().includes(q)
      )
    );
  }, [records, search]);

  function initForm(record?: AirtableRecord | null) {
    if (record) {
      setFormValues({ ...record.fields });
      setJsonData(JSON.stringify(record.fields, null, 2));
    } else {
      setFormValues({});
      setJsonData("{}");
    }
  }

  function openCreate() {
    setEditing(null);
    initForm(null);
    setModalOpen(true);
  }

  function handleEdit(id: string) {
    const record = records.find((r) => r.id === id);
    if (record) {
      setEditing(record);
      initForm(record);
      setModalOpen(true);
    }
  }

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    try {
      let fields: Record<string, unknown>;
      if (jsonMode) {
        fields = JSON.parse(jsonData);
      } else {
        // Clean empty values
        fields = Object.fromEntries(
          Object.entries(formValues).filter(([, v]) => v !== "" && v !== undefined && v !== null)
        );
      }

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
      fetchRecords();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this record?")) return;
    try {
      const res = await fetch(`/api/${apiPath}/${id}`, { method: "DELETE" });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error); }
      fetchRecords();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  function renderFormField(field: FieldSchema) {
    const value = formValues[field.name] ?? "";
    const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

    switch (field.type) {
      case "select":
        return (
          <select
            value={String(value)}
            onChange={(e) => setFormValues((p) => ({ ...p, [field.name]: e.target.value }))}
            className={inputClass}
          >
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case "multiline":
        return (
          <textarea
            value={String(value)}
            onChange={(e) => setFormValues((p) => ({ ...p, [field.name]: e.target.value }))}
            className={`${inputClass} h-24`}
          />
        );
      case "boolean":
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => setFormValues((p) => ({ ...p, [field.name]: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Yes</span>
          </label>
        );
      case "number":
        return (
          <input
            type="number"
            value={value === "" ? "" : Number(value)}
            onChange={(e) => setFormValues((p) => ({ ...p, [field.name]: e.target.value ? Number(e.target.value) : "" }))}
            className={inputClass}
          />
        );
      case "array":
        return (
          <input
            type="text"
            value={Array.isArray(value) ? value.join(", ") : String(value)}
            onChange={(e) => setFormValues((p) => ({ ...p, [field.name]: e.target.value }))}
            className={inputClass}
            placeholder="Linked record IDs (read-only)"
            disabled
          />
        );
      default:
        return (
          <input
            type={field.type === "email" ? "email" : field.type === "url" ? "url" : field.type === "date" ? "date" : "text"}
            value={String(value)}
            onChange={(e) => setFormValues((p) => ({ ...p, [field.name]: e.target.value }))}
            className={inputClass}
          />
        );
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? "Loading..." : `${filtered.length} record${filtered.length !== 1 ? "s" : ""}`}
            {search && ` matching "${search}"`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
        >
          Add Record
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="underline ml-3">Dismiss</button>
        </div>
      )}

      {/* Search & Actions */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search records..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          onClick={fetchRecords}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? `Edit Record` : `New Record`}
      >
        <div className="space-y-4">
          {/* Toggle JSON mode */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!jsonMode) {
                  setJsonData(JSON.stringify(formValues, null, 2));
                } else {
                  try {
                    setFormValues(JSON.parse(jsonData));
                  } catch {
                    // Keep current form values if JSON is invalid
                  }
                }
                setJsonMode(!jsonMode);
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              {jsonMode ? "Switch to Form" : "Switch to JSON"}
            </button>
          </div>

          {jsonMode ? (
            <textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm h-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          ) : schema.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {schema
                .filter((f) => f.type !== "array") // Hide linked record fields (read-only)
                .map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.name}
                  </label>
                  {renderFormField(field)}
                </div>
              ))}
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-2">
                Enter fields as JSON (field names must match Airtable columns).
              </p>
              <textarea
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm h-48 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
            <button
              onClick={() => { setModalOpen(false); setEditing(null); }}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
