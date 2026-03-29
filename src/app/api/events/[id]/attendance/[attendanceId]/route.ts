import { NextRequest, NextResponse } from "next/server";
import { getTable } from "@/lib/airtable";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attendanceId: string }> }
) {
  try {
    const { attendanceId } = await params;
    const body = await request.json();
    const { fields } = body;

    if (!fields || typeof fields !== "object") {
      return NextResponse.json({ error: "fields object is required" }, { status: 400 });
    }

    const rsvpTable = getTable("rsvp");
    const record = await rsvpTable.update(attendanceId, fields);

    // If a Technical Official was marked as Attended, link to TO Training
    const role = record.get("Role") as string;
    const status = fields["Status"] || fields["Attendance Status"];
    if (role === "Technical Official" && status === "Attended") {
      try {
        const personIds = record.get("Person") as string[] | undefined;
        const eventIds = record.get("Event") as string[] | undefined;

        if (personIds?.[0] && eventIds?.[0]) {
          const eventsTable = getTable("events");
          const event = await eventsTable.find(eventIds[0]);
          const eventName = event.get("Event Name") as string || "Event";
          const eventDate = event.get("Start Date") as string;

          const toTrainingTable = getTable("toTraining");
          await toTrainingTable.create([{
            fields: {
              "Training Name": `TO Experience \u2014 ${eventName}`,
              "Course Type": "Practical Exam",
              "Date": eventDate || new Date().toISOString().split("T")[0],
              "Technical Official": personIds,
              "Result": "Pass",
            },
          }]);
        }
      } catch (err) {
        console.error("Failed to auto-create TO Training record:", err);
        // Don't fail the attendance update if TO training linking fails
      }
    }

    return NextResponse.json({
      id: record.id,
      fields: record.fields,
      createdTime: record._rawJson.createdTime,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update attendance";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; attendanceId: string }> }
) {
  try {
    const { attendanceId } = await params;
    const rsvpTable = getTable("rsvp");
    await rsvpTable.destroy(attendanceId);
    return NextResponse.json({ deleted: true, id: attendanceId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete attendance";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
