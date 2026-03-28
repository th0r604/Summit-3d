"use client";

import { useState } from "react";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "phone" | "date" | "number" | "select" | "textarea";
  options?: string[];
  required?: boolean;
}

interface Props {
  fields: FieldConfig[];
  initialValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => void;
  submitLabel?: string;
  loading?: boolean;
}

export default function EntityForm({ fields, initialValues = {}, onSubmit, submitLabel = "Save", loading }: Props) {
  const [values, setValues] = useState<Record<string, unknown>>(
    fields.reduce((acc, f) => ({ ...acc, [f.name]: initialValues[f.name] ?? "" }), {})
  );
  const [errors, setErrors] = useState<string[]>([]);

  function handleChange(name: string, value: unknown) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const missing = fields
      .filter((f) => f.required && !values[f.name])
      .map((f) => `${f.label} is required`);
    if (missing.length) {
      setErrors(missing);
      return;
    }
    setErrors([]);
    // Remove empty optional fields
    const cleaned = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v !== "" && v !== undefined)
    );
    onSubmit(cleaned);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
          {errors.map((e, i) => <p key={i}>{e}</p>)}
        </div>
      )}
      {fields.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          {field.type === "select" ? (
            <select
              value={String(values[field.name] ?? "")}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select...</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : field.type === "textarea" ? (
            <textarea
              value={String(values[field.name] ?? "")}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24"
            />
          ) : (
            <input
              type={field.type === "phone" ? "tel" : field.type}
              value={String(values[field.name] ?? "")}
              onChange={(e) => handleChange(field.name, field.type === "number" ? Number(e.target.value) : e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
