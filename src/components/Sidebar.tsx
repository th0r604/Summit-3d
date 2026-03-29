"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

interface NavItem { href: string; label: string; }
interface NavSection { label: string; minRole: "member" | "club_admin" | "nf_admin"; items: NavItem[]; }

const ROLE_LEVEL: Record<string, number> = { nf_admin: 3, club_admin: 2, member: 1 };

const NAV_SECTIONS: NavSection[] = [
  { label: "Overview", minRole: "member", items: [{ href: "/dashboard", label: "Dashboard" }] },
  {
    label: "My Account", minRole: "member",
    items: [
      { href: "/me/profile", label: "My Profile" },
      { href: "/me/events", label: "My Events" },
      { href: "/me/certifications", label: "My Certifications" },
      { href: "/me/membership", label: "My Membership" },
      { href: "/me/events/submit", label: "Submit Event" },
    ],
  },
  {
    label: "Club", minRole: "club_admin",
    items: [
      { href: "/club/members", label: "Club Members" },
      { href: "/club/athletes", label: "Club Athletes" },
      { href: "/club/events", label: "Club Events" },
    ],
  },
  {
    label: "People", minRole: "nf_admin",
    items: [
      { href: "/people", label: "People" },
      { href: "/athletes", label: "Athletes" },
      { href: "/coaches", label: "Coaches" },
      { href: "/managers", label: "Managers" },
    ],
  },
  {
    label: "Organizations", minRole: "nf_admin",
    items: [
      { href: "/clubs", label: "Clubs" },
      { href: "/board", label: "Board" },
      { href: "/committees", label: "Assoc/Committees" },
    ],
  },
  {
    label: "Events & Activities", minRole: "nf_admin",
    items: [
      { href: "/events", label: "Events" },
      { href: "/rsvp", label: "Attendance" },
      { href: "/workouts", label: "Workouts" },
      { href: "/courses", label: "Courses" },
    ],
  },
  {
    label: "Officials", minRole: "nf_admin",
    items: [
      { href: "/technical-officials", label: "Technical Officials" },
      { href: "/to-training", label: "TO Training" },
    ],
  },
  {
    label: "Content", minRole: "nf_admin",
    items: [
      { href: "/news", label: "News" },
      { href: "/resources", label: "Resources" },
      { href: "/surveys", label: "Surveys" },
    ],
  },
  {
    label: "Admin", minRole: "nf_admin",
    items: [
      { href: "/memberships", label: "Memberships" },
      { href: "/stripe", label: "Stripe/Payments" },
      { href: "/inventory", label: "Inventory" },
      { href: "/circle21", label: "Circle 21 Sync" },
      { href: "/if3-sync", label: "IF3 Sync" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = (session?.user as Record<string, unknown> | undefined)?.role as string || "member";
  const userName = session?.user?.name || "User";
  const userLevel = ROLE_LEVEL[userRole] || 1;

  const visibleSections = NAV_SECTIONS.filter(
    (section) => userLevel >= ROLE_LEVEL[section.minRole]
  );

  return (
    <aside className="w-64 bg-gray-900 text-gray-100 min-h-screen flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">CF3</h1>
        <p className="text-xs text-gray-400 mt-1">Canadian Functional Fitness Federation</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {visibleSections.map((section) => (
          <div key={section.label}>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{section.label}</h2>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link href={item.href} className={`block px-3 py-2 rounded-lg text-sm transition ${isActive ? "bg-blue-600 text-white font-medium" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-xs text-gray-400 capitalize">{userRole.replace("_", " ")}</p>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-xs text-gray-400 hover:text-white transition ml-3 whitespace-nowrap">Sign out</button>
        </div>
      </div>
    </aside>
  );
}
