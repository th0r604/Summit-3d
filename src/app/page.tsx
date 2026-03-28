"use client";

import { useEffect, useState } from "react";
import StatsCard from "@/components/StatsCard";
import Link from "next/link";

interface Stats {
  people: number;
  athletes: number;
  clubs: number;
  events: number;
  technicalOfficials: number;
  memberships: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    people: 0,
    athletes: 0,
    clubs: 0,
    events: 0,
    technicalOfficials: 0,
    memberships: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const endpoints = ["people", "athletes", "clubs", "events", "technical-officials", "memberships"];
        const results = await Promise.allSettled(
          endpoints.map((e) => fetch(`/api/${e}`).then((r) => r.json()))
        );
        setStats({
          people: results[0].status === "fulfilled" ? results[0].value.records?.length ?? 0 : 0,
          athletes: results[1].status === "fulfilled" ? results[1].value.records?.length ?? 0 : 0,
          clubs: results[2].status === "fulfilled" ? results[2].value.records?.length ?? 0 : 0,
          events: results[3].status === "fulfilled" ? results[3].value.records?.length ?? 0 : 0,
          technicalOfficials: results[4].status === "fulfilled" ? results[4].value.records?.length ?? 0 : 0,
          memberships: results[5].status === "fulfilled" ? results[5].value.records?.length ?? 0 : 0,
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
    { href: "/people", label: "Add Person", section: "People" },
    { href: "/athletes", label: "Add Athlete", section: "Athletes" },
    { href: "/clubs", label: "Add Club", section: "Clubs" },
    { href: "/events", label: "Create Event", section: "Events" },
    { href: "/technical-officials", label: "Add Official", section: "Officials" },
    { href: "/memberships", label: "Memberships", section: "Admin" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-1">Canadian Functional Fitness Federation</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatsCard label="People" value={loading ? "..." : stats.people} color="blue" />
        <StatsCard label="Athletes" value={loading ? "..." : stats.athletes} color="green" />
        <StatsCard label="Clubs" value={loading ? "..." : stats.clubs} color="purple" />
        <StatsCard label="Events" value={loading ? "..." : stats.events} color="orange" />
        <StatsCard label="Officials" value={loading ? "..." : stats.technicalOfficials} color="blue" />
        <StatsCard label="Memberships" value={loading ? "..." : stats.memberships} color="green" />
      </div>

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

      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">CF3 Database Tables</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
          {[
            { href: "/people", label: "People" },
            { href: "/athletes", label: "Athletes" },
            { href: "/coaches", label: "Coaches" },
            { href: "/managers", label: "Managers" },
            { href: "/clubs", label: "Clubs" },
            { href: "/events", label: "CFFF Events" },
            { href: "/rsvp", label: "RSVP" },
            { href: "/workouts", label: "Workouts" },
            { href: "/courses", label: "Courses" },
            { href: "/technical-officials", label: "Technical Officials" },
            { href: "/to-training", label: "TO Training" },
            { href: "/news", label: "News" },
            { href: "/resources", label: "Resources" },
            { href: "/surveys", label: "Surveys" },
            { href: "/board", label: "Board" },
            { href: "/committees", label: "Assoc/Cmte" },
            { href: "/memberships", label: "Memberships" },
            { href: "/stripe", label: "Stripe" },
            { href: "/inventory", label: "Inventory" },
          ].map((t) => (
            <Link key={t.href} href={t.href} className="px-3 py-2 bg-gray-50 rounded hover:bg-blue-50 transition">
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
