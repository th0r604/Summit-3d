"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EventForm from "@/components/EventForm";

export default function CreateEventPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(fields: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details?.join(", "));
      router.push(`/events/${data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create event");
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create Event</h1>
        <p className="text-sm text-gray-500 mt-1">Add a new event to the CF3 calendar</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border p-6">
        <EventForm mode="create" onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
