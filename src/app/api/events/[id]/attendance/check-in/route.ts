import { NextRequest, NextResponse } from "next/server";
import { getTable } from "@/lib/airtable";
import { auth } from "@/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as unknown as Record<string, unknown>).id as string;

    // Find the user's RSVP for this event
    const rsvpTable = getTable("rsvp");
    const records = await rsvpTable
      .select({
        filterByFormula: `AND(FIND("${eventId}", ARRAYJOIN({Event})), FIND("${userId}", ARRAYJOIN({Person})))`,
        maxRecords: 1,
      })
      .all();

    if (records.length === 0) {
      return NextResponse.json({ error: "No RSVP found for this event. Please RSVP first." }, { status: 404 });
    }

    const rsvp = records[0];
    const currentStatus = String(rsvp.get("Status") || rsvp.get("Attendance Status") || "");

    if (currentStatus === "Attended") {
      return NextResponse.json({ error: "Already checked in" }, { status: 400 });
    }

    const updated = await rsvpTable.update(rsvp.id, { "Status": "Attended" });

    return NextResponse.json({
      id: updated.id,
      fields: updated.fields,
      message: "Successfully checked in!",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Check-in failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
