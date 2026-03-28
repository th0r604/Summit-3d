import { NextRequest, NextResponse } from "next/server";
import { getTable, TABLE_NAMES, TableKey } from "@/lib/airtable";

// Map URL slugs to table keys
const SLUG_TO_KEY: Record<string, TableKey> = {
  "people": "people",
  "stripe": "stripe",
  "athletes": "athletes",
  "managers": "managers",
  "coaches": "coaches",
  "technical-officials": "technicalOfficials",
  "clubs": "clubs",
  "events": "events",
  "rsvp": "rsvp",
  "to-training": "toTraining",
  "workouts": "workouts",
  "news": "news",
  "board": "board",
  "committees": "committees",
  "resources": "resources",
  "memberships": "memberships",
  "surveys": "surveys",
  "inventory": "inventory",
  "courses": "courses",
};

interface FieldSchema {
  name: string;
  type: "text" | "email" | "number" | "date" | "boolean" | "select" | "multiline" | "array" | "url";
  sample?: unknown;
}

function inferFieldType(key: string, values: unknown[]): FieldSchema["type"] {
  // Check field name hints first
  const lower = key.toLowerCase();
  if (lower.includes("email")) return "email";
  if (lower.includes("url") || lower.includes("website") || lower.includes("link")) return "url";
  if (lower.includes("date") || lower.includes("created") || lower.includes("expir")) return "date";
  if (lower.includes("description") || lower.includes("notes") || lower.includes("bio") || lower.includes("address")) return "multiline";

  // Check actual values
  const nonNull = values.filter((v) => v !== null && v !== undefined && v !== "");
  if (nonNull.length === 0) return "text";

  const first = nonNull[0];
  if (typeof first === "number") return "number";
  if (typeof first === "boolean") return "boolean";
  if (Array.isArray(first)) return "array";

  if (typeof first === "string") {
    // Check if it looks like a date (ISO format)
    if (/^\d{4}-\d{2}-\d{2}/.test(first)) return "date";
    // Check if it looks like an email
    if (first.includes("@") && first.includes(".")) return "email";
    // Check if it looks like a URL
    if (first.startsWith("http://") || first.startsWith("https://")) return "url";
    // Check if it's long text
    if (first.length > 100 || first.includes("\n")) return "multiline";

    // Check if it looks like a select field (few unique values across records)
    const unique = new Set(nonNull.map(String));
    if (unique.size <= 10 && nonNull.length >= 3) return "select";
  }

  return "text";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table: slug } = await params;
    const tableKey = SLUG_TO_KEY[slug];

    if (!tableKey) {
      return NextResponse.json({ error: `Unknown table: ${slug}` }, { status: 404 });
    }

    const table = getTable(tableKey);
    const records = await table.select({ maxRecords: 20 }).all();

    if (records.length === 0) {
      return NextResponse.json({
        table: TABLE_NAMES[tableKey],
        fields: [],
        recordCount: 0,
      });
    }

    // Collect all field names and their values across records
    const fieldValues: Record<string, unknown[]> = {};
    for (const record of records) {
      for (const [key, value] of Object.entries(record.fields)) {
        if (!fieldValues[key]) fieldValues[key] = [];
        fieldValues[key].push(value);
      }
    }

    // Build schema
    const fields: (FieldSchema & { options?: string[] })[] = Object.entries(fieldValues).map(([name, values]) => {
      const type = inferFieldType(name, values);
      const schema: FieldSchema & { options?: string[] } = { name, type };

      // For select fields, include the unique options
      if (type === "select") {
        const unique = [...new Set(values.filter((v) => v !== null && v !== undefined && v !== "").map(String))];
        schema.options = unique.sort();
      }

      // Include a sample value
      const sample = values.find((v) => v !== null && v !== undefined && v !== "");
      if (sample !== undefined) schema.sample = sample;

      return schema;
    });

    return NextResponse.json({
      table: TABLE_NAMES[tableKey],
      fields,
      recordCount: records.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch schema";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
