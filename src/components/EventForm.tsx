"use client";

import { useState, useEffect } from "react";

const EVENT_TYPES = ["Competition", "Seminar", "Workshop", "Training Camp", "Social", "Other"];
const SANCTION_LEVELS = ["CF3 Sanctioned", "Community", "International", "Provincial", "Other"];
const EVENT_STATUSES = ["Draft", "Pending Approval", "Open Registration", "Closed", "In Progress", "Completed", "Cancelled"];
const PROVINCES = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"];

interface Club {
  id: string;
  fields: Record<string, unknown>;
}

interface Props {
  initialValues?: Record<string, unknown>;
  onSubmit: (fields: Record<string, unknown>) => void;
  loading?: boolean;
  mode: "create" | "edit";
  showAdminFields?: boolean;
}

export default function EventForm({ initialValues = {}, onSubmit, loading, mode, showAdminFields = true }: Props) {
  const [form, setForm] = useState<Record<string, unknown>>({
    "Event Name": "",
    "Event Type": "Competition",
    "Sanction Level": "Community",
    "Start Date": "",
    "End Date": "",
    "Location": "",
    "Province": "",
    "City": "",
    "Description": "",
    "Max Participants": "",
    "Status": mode === "create" ? "Draft" : "",
    ...initialValues,
  });
  const [clubs, setClubs] = useState<Club[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/clubs")
      .then((r) => r.json())
      .then((data) => {
        if (data.records) setClubs(data.records);
      })
      .catch(() => {});
  }, []);

  function update(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: string[] = [];
    if (!form["Event Name"]) errs.push("Event Name is required");
    if (!form["Event Type"]) errs.push("Event Type is required");
    if (!form["Start Date"]) errs.push("Start Date is required");
    if (form["End Date"] && form["Start Date"] && new Date(String(form["End Date"])) < new Date(String(form["Start Date"]))) {
      errs.push("End Date must be after Start Date");
    }
    if (errs.length) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    // Clean empty values
    const cleaned = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== "" && v !== undefined && v !== null)
    );
    onSubmit(cleaned);
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
          {errors.map((e, i) => <p key={i}>{e}</p>)}
        </div>
      )}

      {/* Basic Info */}
      <fieldset>
        <legend className="text-lg font-semibold text-gray-900 mb-4">Basic Information</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={String(form["Event Name"] || "")}
              onChange={(e) => update("Event Name", e.target.value)}
              className={inputClass}
              placeholder="e.g., CF3 National Championship 2026"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Type <span className="text-red-500">*</span>
            </label>
            <select value={String(form["Event Type"] || "")} onChange={(e) => update("Event Type", e.target.value)} className={inputClass}>
              <option value="">Select type...</option>
              {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {showAdminFields && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sanction Level</label>
              <select value={String(form["Sanction Level"] || "")} onChange={(e) => update("Sanction Level", e.target.value)} className={inputClass}>
                <option value="">Select...</option>
                {SANCTION_LEVELS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={String(form["Description"] || "")}
              onChange={(e) => update("Description", e.target.value)}
              className={`${inputClass} h-24`}
              placeholder="Describe the event..."
            />
          </div>
        </div>
      </fieldset>

      {/* Date & Time */}
      <fieldset>
        <legend className="text-lg font-semibold text-gray-900 mb-4">Date & Time</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={String(form["Start Date"] || "")}
              onChange={(e) => update("Start Date", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
            <input
              type="datetime-local"
              value={String(form["End Date"] || "")}
              onChange={(e) => update("End Date", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </fieldset>

      {/* Location */}
      <fieldset>
        <legend className="text-lg font-semibold text-gray-900 mb-4">Location</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue / Location</label>
            <input
              type="text"
              value={String(form["Location"] || "")}
              onChange={(e) => update("Location", e.target.value)}
              className={inputClass}
              placeholder="e.g., Vancouver Convention Centre"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={String(form["City"] || "")}
              onChange={(e) => update("City", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
            <select value={String(form["Province"] || "")} onChange={(e) => update("Province", e.target.value)} className={inputClass}>
              <option value="">Select province...</option>
              {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </fieldset>

      {/* Host & Settings */}
      <fieldset>
        <legend className="text-lg font-semibold text-gray-900 mb-4">Host & Settings</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Host Club</label>
            <select
              value={String(form["Host Club"] || "")}
              onChange={(e) => {
                const val = e.target.value;
                update("Host Club", val ? [val] : "");
              }}
              className={inputClass}
            >
              <option value="">No host club</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {String(club.fields["Club Name"] || club.fields["Name"] || club.id)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
            <input
              type="number"
              value={String(form["Max Participants"] || "")}
              onChange={(e) => update("Max Participants", e.target.value ? Number(e.target.value) : "")}
              className={inputClass}
              min="1"
            />
          </div>
          {showAdminFields && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={String(form["Status"] || "")} onChange={(e) => update("Status", e.target.value)} className={inputClass}>
                {EVENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>
      </fieldset>

      {/* Submit */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
        >
          {loading ? "Saving..." : mode === "create" ? "Create Event" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
