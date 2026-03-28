"use client";

import { useEffect, useState, useCallback } from "react";

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
  createdTime: string;
}

export default function Home() {
  const [records, setRecords] = useState<AirtableRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<string>("");
  const [newFields, setNewFields] = useState<string>('{"Name": ""}');

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/records");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRecords(data.records);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  async function createRecord() {
    try {
      const fields = JSON.parse(newFields);
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNewFields('{"Name": ""}');
      fetchRecords();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create record");
    }
  }

  async function updateRecord(id: string) {
    try {
      const fields = JSON.parse(editFields);
      const res = await fetch(`/api/records/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEditingId(null);
      fetchRecords();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update record");
    }
  }

  async function deleteRecord(id: string) {
    if (!confirm("Delete this record?")) return;
    try {
      const res = await fetch(`/api/records/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchRecords();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete record");
    }
  }

  function startEdit(record: AirtableRecord) {
    setEditingId(record.id);
    setEditFields(JSON.stringify(record.fields, null, 2));
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Summit 3D — Airtable Dashboard</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {error}
          <button onClick={() => setError(null)} className="ml-4 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Create Record */}
      <section className="mb-8 bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Create Record</h2>
        <textarea
          value={newFields}
          onChange={(e) => setNewFields(e.target.value)}
          className="w-full border rounded-lg p-3 font-mono text-sm mb-3 h-24"
          placeholder='{"Name": "Example", "Status": "Active"}'
        />
        <button
          onClick={createRecord}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Create
        </button>
      </section>

      {/* Records List */}
      <section className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Records</h2>
          <button
            onClick={fetchRecords}
            className="text-blue-600 hover:underline text-sm"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : records.length === 0 ? (
          <p className="text-gray-500">No records found. Create one above or check your .env.local configuration.</p>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <code className="text-xs text-gray-400">{record.id}</code>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(record)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteRecord(record.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {editingId === record.id ? (
                  <div>
                    <textarea
                      value={editFields}
                      onChange={(e) => setEditFields(e.target.value)}
                      className="w-full border rounded-lg p-3 font-mono text-sm mb-3 h-32"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateRecord(record.id)}
                        className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-200 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <pre className="text-sm bg-gray-50 p-3 rounded overflow-auto">
                    {JSON.stringify(record.fields, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
