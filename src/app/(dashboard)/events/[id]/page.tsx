"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import StatsCard from "@/components/StatsCard";
import StatusBadge from "@/components/StatusBadge";

interface EventData {
  id: string;
  fields: Record<string, unknown>;
  attendanceCounts: {
    total: number;
    athletes: number;
    technicalOfficials: number;
    volunteers: number;
    parents: number;
    attended: number;
  };
  canEdit: boolean;
}

interface AttendanceRecord {
  id: string;
  fields: Record<string, unknown>;
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventData | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"attendees" | "details">("attendees");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [eventRes, attendanceRes] = await Promise.all([
        fetch(`/api/events/${id}`),
        fetch(`/api/events/${id}/attendance`),
      ]);
      const eventData = await eventRes.json();
      const attendanceData = await attendanceRes.json();

      if (eventRes.ok) setEvent(eventData);
      else throw new Error(eventData.error);

      if (attendanceRes.ok) setAttendance(attendanceData.attendance || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load event");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleBulkMark() {
    if (!bulkAction || selectedIds.size === 0) return;
    for (const attendanceId of selectedIds) {
      try {
        await fetch(`/api/events/${id}/attendance/${attendanceId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields: { "Status": bulkAction } }),
        });
      } catch {
        // Continue with others
      }
    }
    setSelectedIds(new Set());
    setBulkAction("");
    fetchData();
  }

  async function handleApprove() {
    try {
      await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: { "Status": "Open Registration" } }),
      });
      fetchData();
    } catch {
      setError("Failed to approve event");
    }
  }

  function toggleSelect(attendanceId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(attendanceId)) next.delete(attendanceId);
      else next.add(attendanceId);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map((i) => <div key={i} className="h-20 bg-gray-200 rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return <div className="p-8"><p className="text-gray-500">Event not found.</p></div>;
  }

  const f = event.fields;
  const counts = event.attendanceCounts;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{String(f["Event Name"] || "Untitled Event")}</h1>
            {f["Status"] ? <StatusBadge status={String(f["Status"])} /> : null}
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {f["Event Type"] ? <span>{String(f["Event Type"])}</span> : null}
            {f["Sanction Level"] ? <span>{String(f["Sanction Level"])}</span> : null}
            {f["Start Date"] ? <span>{new Date(String(f["Start Date"])).toLocaleDateString()}</span> : null}
            {f["Location"] ? <span>{String(f["Location"])}</span> : null}
          </div>
        </div>
        <div className="flex gap-2">
          {f["Status"] === "Pending Approval" && (
            <button onClick={handleApprove} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
              Approve
            </button>
          )}
          {event.canEdit && (
            <button
              onClick={() => router.push(`/events/${id}/edit`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
            >
              Edit Event
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatsCard label="Total RSVPs" value={counts.total} color="blue" />
        <StatsCard label="Athletes" value={counts.athletes} color="green" />
        <StatsCard label="Officials" value={counts.technicalOfficials} color="purple" />
        <StatsCard label="Volunteers" value={counts.volunteers} color="orange" />
        <StatsCard label="Attended" value={counts.attended} color="green" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
        <button onClick={() => setTab("attendees")} className={`px-4 py-2 rounded-md text-sm font-medium transition ${tab === "attendees" ? "bg-white shadow-sm" : "text-gray-500"}`}>
          Attendees ({counts.total})
        </button>
        <button onClick={() => setTab("details")} className={`px-4 py-2 rounded-md text-sm font-medium transition ${tab === "details" ? "bg-white shadow-sm" : "text-gray-500"}`}>
          Details
        </button>
      </div>

      {tab === "attendees" && (
        <div className="bg-white rounded-lg border">
          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <div className="p-4 border-b bg-blue-50 flex items-center gap-3">
              <span className="text-sm font-medium">{selectedIds.size} selected</span>
              <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm">
                <option value="">Mark as...</option>
                <option value="Attended">Attended</option>
                <option value="No-Show">No-Show</option>
                <option value="Confirmed">Confirmed</option>
              </select>
              <button onClick={handleBulkMark} disabled={!bulkAction} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm disabled:opacity-50">
                Apply
              </button>
            </div>
          )}

          {attendance.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400">No attendees registered yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="py-3 px-4 w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === attendance.length && attendance.length > 0}
                      onChange={() => {
                        if (selectedIds.size === attendance.length) setSelectedIds(new Set());
                        else setSelectedIds(new Set(attendance.map((a) => a.id)));
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((a) => (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(a.id)}
                        onChange={() => toggleSelect(a.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="py-3 px-4">{String(a.fields["Name"] || "—")}</td>
                    <td className="py-3 px-4">
                      {a.fields["Role"] ? (
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                          {String(a.fields["Role"])}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={String(a.fields["Status"] || a.fields["Attendance Status"] || "Registered")} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "details" && (
        <div className="bg-white rounded-lg border p-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {Object.entries(f).map(([key, value]) => {
              if (value === null || value === undefined || value === "") return null;
              if (Array.isArray(value)) return null;
              return (
                <div key={key}>
                  <dt className="text-sm font-medium text-gray-500">{key}</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {key.includes("Date") ? new Date(String(value)).toLocaleString() : String(value)}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      )}
    </div>
  );
}
