import { NextRequest, NextResponse } from "next/server";
import { getTable } from "@/lib/airtable";
import { auth } from "@/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const table = getTable("events");
    const record = await table.find(id);

    // Fetch attendance counts for this event
    const rsvpTable = getTable("rsvp");
    let attendanceCounts = { total: 0, athletes: 0, technicalOfficials: 0, volunteers: 0, parents: 0, attended: 0 };
    try {
      const rsvps = await rsvpTable
        .select({ filterByFormula: `FIND("${id}", ARRAYJOIN({Event}))` })
        .all();
      attendanceCounts.total = rsvps.length;
      for (const rsvp of rsvps) {
        const role = String(rsvp.get("Role") || "");
        if (role === "Athlete") attendanceCounts.athletes++;
        else if (role === "Technical Official") attendanceCounts.technicalOfficials++;
        else if (role === "Volunteer") attendanceCounts.volunteers++;
        else if (role === "Parent/Guardian") attendanceCounts.parents++;
        const status = String(rsvp.get("Attendance Status") || rsvp.get("Status") || "");
        if (status === "Attended") attendanceCounts.attended++;
      }
    } catch {
      // Attendance counts are optional, don't fail the request
    }

    // Check if current user can edit this event
    let canEdit = false;
    try {
      const session = await auth();
      if (session?.user) {
        const user = session.user as unknown as Record<string, unknown>;
        const role = user.role as string;
        if (role === "nf_admin") {
          canEdit = true;
        } else if (role === "club_admin") {
          const userClubId = user.clubId as string | undefined;
          const hostClub = record.get("Host Club") as string[] | undefined;
          if (userClubId && hostClub?.includes(userClubId)) {
            canEdit = true;
          }
        }
      }
    } catch {
      // Auth check is optional for canEdit
    }

    return NextResponse.json({
      id: record.id,
      fields: record.fields,
      createdTime: record._rawJson.createdTime,
      attendanceCounts,
      canEdit,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Event not found";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { fields } = body;

    if (!fields || typeof fields !== "object") {
      return NextResponse.json({ error: "fields object is required" }, { status: 400 });
    }

    // Check edit permission
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as unknown as Record<string, unknown>;
    const role = user.role as string;

    if (role !== "nf_admin") {
      // Check host ownership
      const table = getTable("events");
      const existing = await table.find(id);
      const hostClub = existing.get("Host Club") as string[] | undefined;
      const userClubId = user.clubId as string | undefined;

      if (!userClubId || !hostClub?.includes(userClubId)) {
        return NextResponse.json({ error: "You can only edit events hosted by your club" }, { status: 403 });
      }
    }

    const table = getTable("events");
    const record = await table.update(id, fields);

    return NextResponse.json({
      id: record.id,
      fields: record.fields,
      createdTime: record._rawJson.createdTime,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const table = getTable("events");
    await table.destroy(id);
    return NextResponse.json({ deleted: true, id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
