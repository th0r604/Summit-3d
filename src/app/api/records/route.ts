import { NextRequest, NextResponse } from "next/server";
import { getTable } from "@/lib/airtable";

// GET /api/records — List all records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get("table") || undefined;
    const table = getTable(tableName);

    const records = await table.select().all();

    const data = records.map((record) => ({
      id: record.id,
      fields: record.fields,
      createdTime: record._rawJson.createdTime,
    }));

    return NextResponse.json({ records: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch records";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/records — Create a new record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fields, table: tableName } = body;

    if (!fields || typeof fields !== "object") {
      return NextResponse.json({ error: "fields object is required" }, { status: 400 });
    }

    const table = getTable(tableName);
    const records = await table.create([{ fields }]);
    const record = records[0];

    return NextResponse.json({
      id: record.id,
      fields: record.fields,
      createdTime: record._rawJson.createdTime,
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create record";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
