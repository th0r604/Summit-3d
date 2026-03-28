"use client";

import { useState } from "react";
import StatusBadge from "./StatusBadge";

export interface Column {
  key: string;
  label: string;
  type?: "text" | "status" | "date" | "number";
}

interface Props {
  columns: Column[];
  data: Array<{ id: string; fields: Record<string, unknown> }>;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRowClick?: (id: string) => void;
  loading?: boolean;
}

export default function DataTable({ columns, data, onEdit, onDelete, onRowClick, loading }: Props) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = String(a.fields[sortKey] ?? "");
    const bVal = String(b.fields[sortKey] ?? "");
    const cmp = aVal.localeCompare(bVal);
    return sortDir === "asc" ? cmp : -cmp;
  });

  if (loading) {
    return <div className="text-gray-500 py-8 text-center">Loading...</div>;
  }

  if (data.length === 0) {
    return <div className="text-gray-500 py-8 text-center">No records found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none"
              >
                {col.label}
                {sortKey === col.key && (sortDir === "asc" ? " ↑" : " ↓")}
              </th>
            ))}
            {(onEdit || onDelete) && <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row.id)}
              className={`border-b border-gray-100 ${onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}`}
            >
              {columns.map((col) => (
                <td key={col.key} className="py-3 px-4">
                  {col.type === "status" ? (
                    <StatusBadge status={String(row.fields[col.key] ?? "")} />
                  ) : col.type === "date" && row.fields[col.key] ? (
                    new Date(String(row.fields[col.key])).toLocaleDateString()
                  ) : (
                    String(row.fields[col.key] ?? "—")
                  )}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="py-3 px-4 text-right space-x-3">
                  {onEdit && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(row.id); }}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(row.id); }}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
