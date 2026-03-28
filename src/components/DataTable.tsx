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

function formatCellValue(value: unknown, type?: string): React.ReactNode {
  if (value === null || value === undefined || value === "") return "—";

  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    // Linked records (array of IDs) or array of strings
    if (typeof value[0] === "string" && value[0].startsWith("rec")) {
      return (
        <span className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
          {value.length} linked
        </span>
      );
    }
    return value.join(", ");
  }

  if (type === "status") {
    return <StatusBadge status={String(value)} />;
  }

  if (type === "date") {
    try {
      return new Date(String(value)).toLocaleDateString();
    } catch {
      return String(value);
    }
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  const str = String(value);
  if (str.length > 80) {
    return str.slice(0, 77) + "...";
  }
  return str;
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
    const cmp = aVal.localeCompare(bVal, undefined, { numeric: true });
    return sortDir === "asc" ? cmp : -cmp;
  });

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-gray-500 text-sm">Loading records...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-400 text-lg mb-1">No records yet</p>
        <p className="text-gray-400 text-sm">Click &quot;Add Record&quot; to create your first entry.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none whitespace-nowrap"
              >
                {col.label}
                {sortKey === col.key && (
                  <span className="ml-1 text-blue-600">{sortDir === "asc" ? "↑" : "↓"}</span>
                )}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="text-right py-3 px-4 font-medium text-gray-600 w-28">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row.id)}
              className={`border-b border-gray-100 transition ${
                i % 2 === 1 ? "bg-gray-50/50" : ""
              } ${onRowClick ? "cursor-pointer hover:bg-blue-50" : "hover:bg-gray-50"}`}
            >
              {columns.map((col) => (
                <td key={col.key} className="py-3 px-4 max-w-xs">
                  {formatCellValue(row.fields[col.key], col.type)}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  {onEdit && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(row.id); }}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(row.id); }}
                      className="text-red-500 hover:text-red-700"
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
