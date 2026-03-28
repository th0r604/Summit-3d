"use client";

import StatsCard from "@/components/StatsCard";

export default function GlobalEventsPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Global Events</h1>
          <p className="text-sm text-gray-500 mt-1">International competitions and events</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
          Create Global Event
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatsCard label="Upcoming Events" value={0} color="blue" />
        <StatsCard label="Active Events" value={0} color="green" />
        <StatsCard label="Completed" value={0} color="purple" />
      </div>

      <div className="bg-white rounded-lg border p-8 text-center">
        <p className="text-gray-400 text-lg mb-1">No global events yet</p>
        <p className="text-gray-400 text-sm">International competitions and multi-country events will be managed here.</p>
      </div>
    </div>
  );
}
