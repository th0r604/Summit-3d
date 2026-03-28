"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";

export default function MyProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const userId = (session?.user as Record<string, unknown>)?.id as string;

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/people/${userId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProfile(data.fields);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  function startEdit() {
    if (!profile) return;
    setForm({
      "First Name": String(profile["First Name"] || ""),
      "Last Name": String(profile["Last Name"] || ""),
      "Email": String(profile["Email"] || ""),
      "Phone": String(profile["Phone"] || ""),
      "City": String(profile["City"] || ""),
      "Province": String(profile["Province"] || ""),
      "Date of Birth": String(profile["Date of Birth"] || ""),
    });
    setEditing(true);
  }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    setError(null);
    try {
      const fields = Object.fromEntries(
        Object.entries(form).filter(([, v]) => v !== "")
      );
      const res = await fetch(`/api/people/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProfile(data.fields);
      setEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const PROVINCES = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"];

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        {!editing && (
          <button onClick={startEdit} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-3 underline">Dismiss</button>
        </div>
      )}

      <div className="bg-white rounded-lg border p-6">
        {editing ? (
          <div className="space-y-4 max-w-lg">
            {[
              { key: "First Name", type: "text" },
              { key: "Last Name", type: "text" },
              { key: "Email", type: "email" },
              { key: "Phone", type: "tel" },
              { key: "City", type: "text" },
              { key: "Date of Birth", type: "date" },
            ].map(({ key, type }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{key}</label>
                <input
                  type={type}
                  value={form[key] || ""}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
              <select
                value={form["Province"] || ""}
                onChange={(e) => setForm((p) => ({ ...p, Province: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select...</option>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => setEditing(false)} className="px-6 py-2 border rounded-lg hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        ) : profile ? (
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {Object.entries(profile).map(([key, value]) => {
              if (key === "Password" || key === "Role") return null;
              if (value === null || value === undefined || value === "") return null;
              if (Array.isArray(value)) return null;
              return (
                <div key={key}>
                  <dt className="text-sm font-medium text-gray-500">{key}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{String(value)}</dd>
                </div>
              );
            })}
          </dl>
        ) : (
          <p className="text-gray-500">Profile not found.</p>
        )}
      </div>
    </div>
  );
}
