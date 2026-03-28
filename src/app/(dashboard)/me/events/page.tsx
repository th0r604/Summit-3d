"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";

interface EventRecord {
  id: string;
  fields: Record<string, unknown>;
}

const RSVP_ROLES = ["Athlete", "Technical Official", "Volunteer", "Parent/Guardian"];

export default function MyEventsPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [myRsvps, setMyRsvps] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [rsvpModal, setRsvpModal] = useState<EventRecord | null>(null);
  const [selectedRole, setSelectedRole] = useState(RSVP_ROLES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"upcoming" | "my-rsvps">("upcoming");

  const userId = (session?.user as Record<string, unknown>)?.id as string;
  const userName = session?.user?.name || "Member";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsRes, rsvpRes] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/rsvp"),
      ]);
      const eventsData = await eventsRes.json();
      const rsvpData = await rsvpRes.json();

      if (eventsRes.ok) setEvents(eventsData.records);
      if (rsvpRes.ok) setMyRsvps(rsvpData.records);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (session) fetchData(); }, [session, fetchData]);

  async function handleRsvp() {
    if (!rsvpModal || !userId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            "Name": userName,
            "Event": [rsvpModal.id],
            "Person": [userId],
            "Role": selectedRole,
            "Status": "Registered",
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details?.join(", "));
      setRsvpModal(null);
      setTab("my-rsvps");
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "RSVP failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Events</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-3 underline">Dismiss</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab("upcoming")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            tab === "upcoming" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Upcoming Events
        </button>
        <button
          onClick={() => setTab("my-rsvps")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            tab === "my-rsvps" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          My RSVPs ({myRsvps.length})
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="inline-block h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-gray-500 text-sm">Loading events...</p>
        </div>
      ) : tab === "upcoming" ? (
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <p className="text-gray-400 text-lg mb-1">No upcoming events</p>
              <p className="text-gray-400 text-sm">Check back soon for new events.</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg border p-5">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {String(event.fields["Event Name"] || "Untitled Event")}
                    </h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      {event.fields["Start Date"] ? (
                        <span>{new Date(String(event.fields["Start Date"])).toLocaleDateString()}</span>
                      ) : null}
                      {event.fields["Location"] ? <span>{String(event.fields["Location"])}</span> : null}
                      {event.fields["Event Type"] ? (
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                          {String(event.fields["Event Type"])}
                        </span>
                      ) : null}
                    </div>
                    {event.fields["Description"] ? (
                      <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                        {String(event.fields["Description"])}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    {event.fields["Status"] ? (
                      <StatusBadge status={String(event.fields["Status"])} />
                    ) : null}
                    <button
                      onClick={() => { setRsvpModal(event); setSelectedRole(RSVP_ROLES[0]); }}
                      className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap"
                    >
                      RSVP
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {myRsvps.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <p className="text-gray-400 text-lg mb-1">No RSVPs yet</p>
              <p className="text-gray-400 text-sm">Browse upcoming events and RSVP to attend.</p>
            </div>
          ) : (
            myRsvps.map((rsvp) => (
              <div key={rsvp.id} className="bg-white rounded-lg border p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{String(rsvp.fields["Name"] || "RSVP")}</h3>
                    <div className="flex gap-3 mt-1 text-sm text-gray-500">
                      {rsvp.fields["Role"] ? (
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                          {String(rsvp.fields["Role"])}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {rsvp.fields["Status"] ? (
                    <StatusBadge status={String(rsvp.fields["Status"])} />
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* RSVP Modal */}
      <Modal
        open={!!rsvpModal}
        onClose={() => setRsvpModal(null)}
        title={`RSVP — ${rsvpModal ? String(rsvpModal.fields["Event Name"] || "Event") : ""}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I am attending as:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {RSVP_ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`p-3 rounded-lg border text-sm font-medium transition ${
                    selectedRole === role
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {rsvpModal?.fields["Start Date"] ? (
            <p className="text-sm text-gray-500">
              Date: {new Date(String(rsvpModal.fields["Start Date"])).toLocaleDateString()}
            </p>
          ) : null}
          {rsvpModal?.fields["Location"] ? (
            <p className="text-sm text-gray-500">
              Location: {String(rsvpModal.fields["Location"])}
            </p>
          ) : null}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleRsvp}
              disabled={submitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Confirm RSVP"}
            </button>
            <button
              onClick={() => setRsvpModal(null)}
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
