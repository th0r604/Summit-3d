"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [{ href: "/", label: "Dashboard" }],
  },
  {
    label: "People",
    items: [
      { href: "/members", label: "Members" },
      { href: "/athletes", label: "Athletes" },
      { href: "/volunteers", label: "Volunteers" },
    ],
  },
  {
    label: "Organizations",
    items: [{ href: "/clubs", label: "Clubs" }],
  },
  {
    label: "Events",
    items: [{ href: "/events", label: "Events" }],
  },
  {
    label: "Officials",
    items: [
      { href: "/technical-officials", label: "Technical Officials" },
      { href: "/to-training", label: "TO Training" },
      { href: "/to-experience", label: "TO Experience" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-gray-100 min-h-screen p-4 flex-shrink-0">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">CFFF</h1>
        <p className="text-xs text-gray-400 mt-1">Canadian Functional Fitness Federation</p>
      </div>
      <nav className="space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {section.label}
            </h2>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block px-3 py-2 rounded-lg text-sm transition ${
                        isActive
                          ? "bg-blue-600 text-white font-medium"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
