import { NextResponse } from "next/server";
import { getTable } from "@/lib/airtable";

export async function GET() {
  try {
    const records: Array<{
      id: string;
      type: string;
      name: string;
      syncedAt: string | null;
      status: string;
    }> = [];

    // Championship events
    const eventsTable = getTable("events");
    const events = await eventsTable
      .select({ filterByFormula: `{Event Type} = "Competition"` })
      .all();

    for (const event of events) {
      records.push({
        id: event.id,
        type: "Championship Event",
        name: String(event.get("Event Name") || "Untitled"),
        syncedAt: (event.get("IF3 Synced At") as string) || null,
        status: event.get("IF3 Synced At") ? "synced" : "pending",
      });
    }

    // TO certifications (Level 2+, Pass)
    const trainingTable = getTable("toTraining");
    const training = await trainingTable.select().all();

    for (const record of training) {
      const courseType = String(record.get("Course Type") || "");
      const result = String(record.get("Result") || "");
      if ((courseType.includes("Level 2") || courseType.includes("Level 3")) && result === "Pass") {
        records.push({
          id: record.id,
          type: "TO Certification",
          name: String(record.get("Training Name") || "Certification"),
          syncedAt: (record.get("IF3 Synced At") as string) || null,
          status: record.get("IF3 Synced At") ? "synced" : "pending",
        });
      }
    }

    return NextResponse.json({ records });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST() {
  const if3BaseId = process.env.IF3_BASE_ID;

  if (!if3BaseId) {
    return NextResponse.json(
      { error: "IF3_BASE_ID is not configured. Add it to .env.local to enable syncing." },
      { status: 400 }
    );
  }

  // TODO: Implement actual sync to IF3 base when IF3_BASE_ID is provided
  return NextResponse.json({
    success: true,
    synced: 0,
    message: "IF3 sync is configured but not yet connected. Contact IF3 for base access.",
  });
}
