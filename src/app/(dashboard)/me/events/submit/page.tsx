"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EventForm from "@/components/EventForm";

export default function SubmitEventPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(fields: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    try {
      // Member submissions always go to Pending Approval
      fields["Status"] = "Pending Approval";

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details?.join(", "));
      router.push("/me/events");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit event");
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Submit an Event</h1>
        <p className="text-sm text-gray-500 mt-1">
          Submit a functional fitness event to the CF3 calendar. Your event will be reviewed by an admin before going live.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-6 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-lg border p-6">
        <EventForm mode="create" onSubmit={handleSubmit} loading={loading} showAdminFields={false} />
      </div>
    </div>
  );
}
