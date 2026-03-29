"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";

const COLUMNS: Column[] = [
  { key: "Event Name", label: "Event Name" },
  { key: "Event Type", label: "Type" },
  { key: "Sanction Level", label: "Sanction" },
  { key: "Start Date", label: "Start Date", type: "date" },
  { key: "Location", label: "Location" },
  { key: "Status", label: "Status", type: "status" },
];

interface EventRecord {
  id: string;
  fields: Record<string, unknown>;
  createdTime: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "pending">("all");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const router = useRouter();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (tab === "pending") params.set("pending", "true");
      if (filterType) params.set("type", filterType);
      if (filterStatus && tab !== "pending") params.set("status", filterStatus);
      if (search) params.set("search", search);

      const res = await fetch(`/api/events?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEvents(data.records);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [tab, filterType, filterStatus, search]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const pendingCount = events.filter((e) => e.fields["Status"] === "Pending Approval").length;

  async function handleDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchEvents();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function handleApprove(id: string) {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: { "Status": "Open Registration" } }),
      });
      if (!res.ok) throw new Error("Failed to approve");
      fetchEvents();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to approve");
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <button
          onClick={() => router.push("/events/create")}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          Create Event
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-3 underline">Dismiss</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab("all")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            tab === "all" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          All Events
        </button>
        <button
          onClick={() => setTab("pending")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            tab === "pending" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Pending Approval {pendingCount > 0 && `(${pendingCount})`}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Types</option>
          {["Competition", "Seminar", "Workshop", "Training Camp", "Social", "Other"].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {tab !== "pending" && (
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            {["Draft", "Pending Approval", "Open Registration", "Closed", "In Progress", "Completed", "Cancelled"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
        <button onClick={fetchEvents} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
          Refresh
        </button>
      </div>

      {/* Pending approval quick actions */}
      {tab === "pending" && events.length > 0 && (
        <div className="space-y-3 mb-4">
          {events.map((event) => (
            <div key={event.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-medium">{String(event.fields["Event Name"] || "Untitled")}</h3>
                <p className="text-sm text-gray-500">
                  {event.fields["Event Type"] ? String(event.fields["Event Type"]) : ""}
                  {event.fields["Start Date"] ? ` — ${new Date(String(event.fields["Start Date"])).toLocaleDateString()}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(event.id)}
                  className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => router.push(`/events/${event.id}`)}
                  className="bg-white border px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50"
                >
                  Review
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="text-red-500 hover:text-red-700 px-2 text-sm"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Events table */}
      {tab === "all" && (
        <div className="bg-white rounded-lg border">
          <DataTable
            columns={COLUMNS}
            data={events}
            loading={loading}
            onRowClick={(id) => router.push(`/events/${id}`)}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
}
