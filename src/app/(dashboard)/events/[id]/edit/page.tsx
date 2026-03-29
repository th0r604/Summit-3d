"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import EventForm from "@/components/EventForm";

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [initialValues, setInitialValues] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.fields) setInitialValues(data.fields);
        else setError(data.error || "Event not found");
      })
      .catch(() => setError("Failed to load event"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(fields: Record<string, unknown>) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/events/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-8"><p className="text-gray-500">Loading event...</p></div>;
  }

  if (!initialValues) {
    return <div className="p-8"><p className="text-red-500">{error || "Event not found"}</p></div>;
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Edit Event</h1>
        <p className="text-sm text-gray-500 mt-1">{String(initialValues["Event Name"] || "")}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-6 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-lg border p-6">
        <EventForm
          mode="edit"
          initialValues={initialValues}
          onSubmit={handleSubmit}
          loading={saving}
        />
      </div>
    </div>
  );
}
