"use client";

import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";

export default function Circle21Page() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleImport() {
    setImporting(true);
    setResult(null);
    // TODO: Implement CSV import or API sync from Circle 21
    setTimeout(() => {
      setResult("Circle 21 import is not yet configured. Upload a CSV export below.");
      setImporting(false);
    }, 1000);
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Circle 21 Sync</h1>
          <p className="text-sm text-gray-500 mt-1">
            Import membership purchases and club registrations from Circle 21
          </p>
        </div>
      </div>

      {result && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-lg mb-4 text-sm">
          {result}
        </div>
      )}

      {/* What syncs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border p-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold">Athlete Memberships</h3>
            <StatusBadge status="Active" />
          </div>
          <p className="text-sm text-gray-500">
            When a member purchases an athlete membership on Circle 21, their status is synced here.
            They become eligible to RSVP to events as an Athlete.
          </p>
        </div>
        <div className="bg-white rounded-lg border p-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold">Club Affiliations</h3>
            <StatusBadge status="Active" />
          </div>
          <p className="text-sm text-gray-500">
            Clubs pay for their CF3 affiliation through Circle 21. Payment status syncs to the Clubs table.
          </p>
        </div>
      </div>

      {/* Manual Import */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Manual Import</h2>
        <p className="text-sm text-gray-500 mb-4">
          Export your Circle 21 data as CSV and upload it here to sync memberships and club registrations.
        </p>
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-400 mb-3">Drop a Circle 21 CSV export here, or click to browse</p>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            id="csv-upload"
            onChange={() => handleImport()}
          />
          <label
            htmlFor="csv-upload"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer text-sm"
          >
            {importing ? "Importing..." : "Upload CSV"}
          </label>
        </div>
      </div>

      {/* Future API integration */}
      <div className="bg-gray-50 border rounded-lg p-4 text-sm text-gray-600">
        <p className="font-medium mb-1">Coming Soon: Automatic Sync</p>
        <p>
          When Circle 21 API or webhook integration is available, memberships and club payments will sync
          automatically without manual CSV imports.
        </p>
      </div>
    </div>
  );
}
