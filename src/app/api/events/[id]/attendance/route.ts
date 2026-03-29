import { NextRequest, NextResponse } from "next/server";
import { getTable } from "@/lib/airtable";
import { validateAttendance } from "@/lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rsvpTable = getTable("rsvp");

    const records = await rsvpTable
      .select({ filterByFormula: `FIND("${id}", ARRAYJOIN({Event}))` })
      .all();

    const attendance = records.map((r) => ({
      id: r.id,
      fields: r.fields,
      createdTime: r._rawJson.createdTime,
    }));

    // Group by role
    const grouped: Record<string, typeof attendance> = {};
    for (const record of attendance) {
      const role = String(record.fields["Role"] || "Other");
      if (!grouped[role]) grouped[role] = [];
      grouped[role].push(record);
    }

    return NextResponse.json({
      attendance,
      grouped,
      total: attendance.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch attendance";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await request.json();
    const { fields } = body;

    if (!fields || typeof fields !== "object") {
      return NextResponse.json({ error: "fields object is required" }, { status: 400 });
    }

    // Ensure Event is linked
    fields["Event"] = [eventId];

    const result = validateAttendance(fields);
    if (!result.valid) {
      return NextResponse.json({ error: "Validation failed", details: result.errors }, { status: 400 });
    }

    // Set default attendance status
    if (!fields["Status"]) fields["Status"] = "Registered";

    const rsvpTable = getTable("rsvp");
    const created = await rsvpTable.create([{ fields }]);
    const record = created[0];

    return NextResponse.json({
      id: record.id,
      fields: record.fields,
      createdTime: record._rawJson.createdTime,
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create RSVP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
