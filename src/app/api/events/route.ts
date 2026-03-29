import { NextRequest, NextResponse } from "next/server";
import { getTable } from "@/lib/airtable";
import { validateEventCreate } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const upcoming = searchParams.get("upcoming");
    const pending = searchParams.get("pending");
    const search = searchParams.get("search");

    const table = getTable("events");
    const filters: string[] = [];

    if (status) filters.push(`{Status} = "${status}"`);
    if (type) filters.push(`{Event Type} = "${type}"`);
    if (upcoming === "true") filters.push(`IS_AFTER({Start Date}, NOW())`);
    if (pending === "true") filters.push(`{Status} = "Pending Approval"`);

    const options: Record<string, unknown> = {};
    if (filters.length === 1) {
      options.filterByFormula = filters[0];
    } else if (filters.length > 1) {
      options.filterByFormula = `AND(${filters.join(", ")})`;
    }

    const records = await table.select(options).all();

    let data = records.map((record) => ({
      id: record.id,
      fields: record.fields,
      createdTime: record._rawJson.createdTime,
    }));

    // Client-side search filter (Airtable SEARCH formula is limited)
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((r) =>
        Object.values(r.fields).some(
          (v) => v !== null && v !== undefined && String(v).toLowerCase().includes(q)
        )
      );
    }

    return NextResponse.json({ records: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch events";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fields } = body;

    if (!fields || typeof fields !== "object") {
      return NextResponse.json({ error: "fields object is required" }, { status: 400 });
    }

    const result = validateEventCreate(fields);
    if (!result.valid) {
      return NextResponse.json({ error: "Validation failed", details: result.errors }, { status: 400 });
    }

    const table = getTable("events");
    const created = await table.create([{ fields }]);
    const record = created[0];

    return NextResponse.json({
      id: record.id,
      fields: record.fields,
      createdTime: record._rawJson.createdTime,
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
