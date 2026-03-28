"use client";

import { useEffect, useState } from "react";
import StatsCard from "@/components/StatsCard";
import Link from "next/link";

interface Stats {
  members: number;
  athletes: number;
  clubs: number;
  events: number;
  volunteers: number;
  technicalOfficials: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    members: 0,
    athletes: 0,
    clubs: 0,
    events: 0,
    volunteers: 0,
    technicalOfficials: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const endpoints = ["members", "athletes", "clubs", "events", "volunteers", "technical-officials"];
        const results = await Promise.allSettled(
          endpoints.map((e) => fetch(`/api/${e}`).then((r) => r.json()))
        );
        setStats({
          members: results[0].status === "fulfilled" ? results[0].value.records?.length ?? 0 : 0,
          athletes: results[1].status === "fulfilled" ? results[1].value.records?.length ?? 0 : 0,
          clubs: results[2].status === "fulfilled" ? results[2].value.records?.length ?? 0 : 0,
          events: results[3].status === "fulfilled" ? results[3].value.records?.length ?? 0 : 0,
          volunteers: results[4].status === "fulfilled" ? results[4].value.records?.length ?? 0 : 0,
          technicalOfficials: results[5].status === "fulfilled" ? results[5].value.records?.length ?? 0 : 0,
        });
      } catch {
        // Stats will show 0 on error
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const QUICK_ACTIONS = [
    { href: "/members", label: "Add Member", section: "Members" },
    { href: "/athletes", label: "Add Athlete", section: "Athletes" },
    { href: "/clubs", label: "Add Club", section: "Clubs" },
    { href: "/events", label: "Create Event", section: "Events" },
    { href: "/volunteers", label: "Assign Volunteer", section: "Volunteers" },
    { href: "/technical-officials", label: "Add Official", section: "Officials" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-1">Canadian Functional Fitness Federation</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatsCard label="Members" value={loading ? "..." : stats.members} color="blue" />
        <StatsCard label="Athletes" value={loading ? "..." : stats.athletes} color="green" />
        <StatsCard label="Clubs" value={loading ? "..." : stats.clubs} color="purple" />
        <StatsCard label="Events" value={loading ? "..." : stats.events} color="orange" />
        <StatsCard label="Volunteers" value={loading ? "..." : stats.volunteers} color="blue" />
        <StatsCard label="Officials" value={loading ? "..." : stats.technicalOfficials} color="green" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="block text-center bg-gray-50 hover:bg-blue-50 border rounded-lg p-4 transition"
            >
              <p className="font-medium text-sm">{action.label}</p>
              <p className="text-xs text-gray-500 mt-1">{action.section}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Setup Guide */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Setup Guide</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <p>1. Add your <code className="bg-gray-100 px-1.5 py-0.5 rounded">AIRTABLE_BASE_ID</code> and <code className="bg-gray-100 px-1.5 py-0.5 rounded">AIRTABLE_TABLE_NAME</code> to <code className="bg-gray-100 px-1.5 py-0.5 rounded">.env.local</code></p>
          <p>2. Create the following tables in your Airtable base: <strong>Members</strong>, <strong>Athletes</strong>, <strong>Clubs</strong>, <strong>Events</strong>, <strong>Volunteers</strong>, <strong>Technical Officials</strong>, <strong>TO Training</strong>, <strong>TO Experience</strong></p>
          <p>3. Start adding data through the dashboard or directly in Airtable</p>
        </div>
      </div>
    </div>
  );
}
