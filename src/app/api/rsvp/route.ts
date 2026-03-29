import { NextRequest, NextResponse } from "next/server";
import { getTable } from "@/lib/airtable";
import { createCreateHandler } from "@/lib/api-helpers";
import { validateRsvp } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const personId = searchParams.get("personId");
    const eventId = searchParams.get("eventId");
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    const table = getTable("rsvp");
    const filters: string[] = [];

    if (personId) filters.push(`FIND("${personId}", ARRAYJOIN({Person}))`);
    if (eventId) filters.push(`FIND("${eventId}", ARRAYJOIN({Event}))`);
    if (role) filters.push(`{Role} = "${role}"`);
    if (status) filters.push(`{Status} = "${status}"`);

    const options: Record<string, unknown> = {};
    if (filters.length === 1) {
      options.filterByFormula = filters[0];
    } else if (filters.length > 1) {
      options.filterByFormula = `AND(${filters.join(", ")})`;
    }

    const records = await table.select(options).all();
    const data = records.map((record) => ({
      id: record.id,
      fields: record.fields,
      createdTime: record._rawJson.createdTime,
    }));

    return NextResponse.json({ records: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch RSVPs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const POST = createCreateHandler("rsvp", validateRsvp);
