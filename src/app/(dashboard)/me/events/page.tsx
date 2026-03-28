"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";

interface EventRecord {
  id: string;
  fields: Record<string, unknown>;
}

export default function MyEventsPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        // Fetch all events — in the future, filter by user's RSVPs
        const res = await fetch("/api/events");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setEvents(data.records);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load events");
      } finally {
        setLoading(false);
      }
    }
    if (session) fetchEvents();
  }, [session]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Events</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading events...</p>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <p className="text-gray-400 text-lg mb-1">No events yet</p>
          <p className="text-gray-400 text-sm">Upcoming events will appear here when available.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg border p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{String(event.fields["Event Name"] || "Untitled Event")}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    {event.fields["Start Date"] ? (
                      <span>{new Date(String(event.fields["Start Date"])).toLocaleDateString()}</span>
                    ) : null}
                    {event.fields["Location"] ? <span>{String(event.fields["Location"])}</span> : null}
                    {event.fields["Event Type"] ? <span>{String(event.fields["Event Type"])}</span> : null}
                  </div>
                </div>
                {event.fields["Status"] ? (
                  <StatusBadge status={String(event.fields["Status"])} />
                ) : null}
              </div>
              {event.fields["Description"] ? (
                <p className="text-sm text-gray-600 mt-3 line-clamp-2">{String(event.fields["Description"])}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
