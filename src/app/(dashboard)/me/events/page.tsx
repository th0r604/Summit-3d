"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import EventCard from "@/components/EventCard";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";

const RSVP_ROLES = ["Athlete", "Technical Official", "Volunteer", "Parent/Guardian"];

interface EventRecord { id: string; fields: Record<string, unknown>; }
interface RsvpRecord { id: string; fields: Record<string, unknown>; }

export default function MyEventsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [myRsvps, setMyRsvps] = useState<RsvpRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"upcoming" | "attendance" | "past">("upcoming");
  const [rsvpModal, setRsvpModal] = useState<EventRecord | null>(null);
  const [selectedRole, setSelectedRole] = useState(RSVP_ROLES[0]);
  const [submitting, setSubmitting] = useState(false);

  const userId = (session?.user as Record<string, unknown>)?.id as string;
  const userName = session?.user?.name || "Member";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsRes, rsvpRes] = await Promise.all([
        fetch("/api/events?upcoming=true"),
        userId ? fetch(`/api/rsvp?personId=${userId}`) : Promise.resolve(null),
      ]);
      const eventsData = await eventsRes.json();
      if (eventsRes.ok) setEvents(eventsData.records);

      if (rsvpRes) {
        const rsvpData = await rsvpRes.json();
        if (rsvpRes.ok) setMyRsvps(rsvpData.records);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { if (session) fetchData(); }, [session, fetchData]);

  async function handleRsvp() {
    if (!rsvpModal || !userId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${rsvpModal.id}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            "Name": userName,
            "Person": [userId],
            "Role": selectedRole,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details?.join(", "));
      setRsvpModal(null);
      setTab("attendance");
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "RSVP failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCheckIn(eventId: string) {
    try {
      const res = await fetch(`/api/events/${eventId}/attendance/check-in`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Check-in failed");
    }
  }

  async function handleCancelRsvp(rsvpId: string) {
    if (!confirm("Cancel your RSVP?")) return;
    try {
      // Find the event ID from the RSVP record
      const rsvp = myRsvps.find((r) => r.id === rsvpId);
      const eventIds = rsvp?.fields["Event"] as string[] | undefined;
      const eventId = eventIds?.[0];
      if (!eventId) return;

      const res = await fetch(`/api/events/${eventId}/attendance/${rsvpId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to cancel");
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to cancel RSVP");
    }
  }

  // Get RSVPed event IDs for de-duplication
  const rsvpedEventIds = new Set(
    myRsvps.flatMap((r) => (r.fields["Event"] as string[]) || [])
  );

  const activeRsvps = myRsvps.filter((r) => {
    const status = String(r.fields["Status"] || "");
    return status !== "No-Show";
  });

  const pastRsvps = myRsvps.filter((r) => {
    const status = String(r.fields["Status"] || "");
    return status === "Attended" || status === "No-Show";
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <button
          onClick={() => router.push("/me/events/submit")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
        >
          Submit Event
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-3 underline">Dismiss</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <button onClick={() => setTab("upcoming")} className={`px-4 py-2 rounded-md text-sm font-medium transition ${tab === "upcoming" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
          Upcoming Events
        </button>
        <button onClick={() => setTab("attendance")} className={`px-4 py-2 rounded-md text-sm font-medium transition ${tab === "attendance" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
          My Attendance ({activeRsvps.length})
        </button>
        <button onClick={() => setTab("past")} className={`px-4 py-2 rounded-md text-sm font-medium transition ${tab === "past" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
          Past Events
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="inline-block h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      ) : tab === "upcoming" ? (
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <p className="text-gray-400 text-lg mb-1">No upcoming events</p>
              <p className="text-gray-400 text-sm">Check back soon or submit your own event.</p>
            </div>
          ) : (
            events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                showRsvpButton={!rsvpedEventIds.has(event.id)}
                userRsvpStatus={rsvpedEventIds.has(event.id) ? "RSVPed" : null}
                onRsvp={() => { setRsvpModal(event); setSelectedRole(RSVP_ROLES[0]); }}
              />
            ))
          )}
        </div>
      ) : tab === "attendance" ? (
        <div className="space-y-3">
          {activeRsvps.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <p className="text-gray-400 text-lg mb-1">No RSVPs yet</p>
              <p className="text-gray-400 text-sm">Browse upcoming events and RSVP to attend.</p>
            </div>
          ) : (
            activeRsvps.map((rsvp) => {
              const status = String(rsvp.fields["Status"] || "Registered");
              const eventIds = rsvp.fields["Event"] as string[] | undefined;
              return (
                <div key={rsvp.id} className="bg-white rounded-lg border p-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{String(rsvp.fields["Name"] || "RSVP")}</h3>
                      <div className="flex gap-2 mt-1">
                        {rsvp.fields["Role"] ? (
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                            {String(rsvp.fields["Role"])}
                          </span>
                        ) : null}
                        <StatusBadge status={status} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {status === "Registered" && eventIds?.[0] && (
                        <button
                          onClick={() => handleCheckIn(eventIds[0])}
                          className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-700"
                        >
                          Check In
                        </button>
                      )}
                      {status === "Registered" && (
                        <button
                          onClick={() => handleCancelRsvp(rsvp.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {pastRsvps.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <p className="text-gray-400">No past events yet.</p>
            </div>
          ) : (
            pastRsvps.map((rsvp) => (
              <div key={rsvp.id} className="bg-white rounded-lg border p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{String(rsvp.fields["Name"] || "Event")}</h3>
                    <div className="flex gap-2 mt-1">
                      {rsvp.fields["Role"] ? (
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{String(rsvp.fields["Role"])}</span>
                      ) : null}
                    </div>
                  </div>
                  <StatusBadge status={String(rsvp.fields["Status"] || "")} />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* RSVP Modal */}
      <Modal open={!!rsvpModal} onClose={() => setRsvpModal(null)} title={`RSVP — ${rsvpModal ? String(rsvpModal.fields["Event Name"] || "Event") : ""}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">I am attending as:</label>
            <div className="grid grid-cols-2 gap-2">
              {RSVP_ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`p-3 rounded-lg border text-sm font-medium transition ${
                    selectedRole === role ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleRsvp} disabled={submitting} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {submitting ? "Submitting..." : "Confirm RSVP"}
            </button>
            <button onClick={() => setRsvpModal(null)} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
