import { NextRequest, NextResponse } from "next/server";
import { getTable } from "@/lib/airtable";

// GET /api/records/[id] — Get a single record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get("table") || undefined;
    const table = getTable(tableName);

    const record = await table.find(id);

    return NextResponse.json({
      id: record.id,
      fields: record.fields,
      createdTime: record._rawJson.createdTime,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Record not found";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

// PATCH /api/records/[id] — Update a record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { fields, table: tableName } = body;

    if (!fields || typeof fields !== "object") {
      return NextResponse.json({ error: "fields object is required" }, { status: 400 });
    }

    const table = getTable(tableName);
    const record = await table.update(id, fields);

    return NextResponse.json({
      id: record.id,
      fields: record.fields,
      createdTime: record._rawJson.createdTime,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update record";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/records/[id] — Delete a record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get("table") || undefined;
    const table = getTable(tableName);

    await table.destroy(id);

    return NextResponse.json({ deleted: true, id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete record";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
