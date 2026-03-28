"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";

interface Record {
  id: string;
  fields: globalThis.Record<string, unknown>;
}

export default function MyCertificationsPage() {
  const { data: session } = useSession();
  const [training, setTraining] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/to-training");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setTraining(data.records);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    if (session) fetchData();
  }, [session]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Certifications & Training</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : training.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <p className="text-gray-400 text-lg mb-1">No certifications yet</p>
          <p className="text-gray-400 text-sm">Your training records and certifications will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {training.map((record) => (
            <div key={record.id} className="bg-white rounded-lg border p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{String(record.fields["Training Name"] || "Training")}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    {record.fields["Course Type"] ? <span>{String(record.fields["Course Type"])}</span> : null}
                    {record.fields["Date"] ? (
                      <span>{new Date(String(record.fields["Date"])).toLocaleDateString()}</span>
                    ) : null}
                    {record.fields["Instructor"] ? <span>Instructor: {String(record.fields["Instructor"])}</span> : null}
                  </div>
                </div>
                <div className="flex gap-2">
                  {record.fields["Result"] ? <StatusBadge status={String(record.fields["Result"])} /> : null}
                </div>
              </div>
              {record.fields["Certificate Number"] ? (
                <p className="text-xs text-gray-400 mt-2">Certificate: {String(record.fields["Certificate Number"])}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
