import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getTable } from "@/lib/airtable";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, type, clubId } = body;

    const ALLOWED_TYPES = ["Athlete", "Technical Official", "Coach"];
    const memberType = ALLOWED_TYPES.includes(type) ? type : "Athlete";

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "First name, last name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const table = getTable("people");
    const existing = await table
      .select({
        filterByFormula: `LOWER({Email}) = "${email.toLowerCase().trim()}"`,
        maxRecords: 1,
      })
      .all();

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Create the record
    const fields: Record<string, string | string[]> = {
      "First Name": firstName.trim(),
      "Last Name": lastName.trim(),
      "Email": email.toLowerCase().trim(),
      "Password": await bcrypt.hash(password, 12),
      "Type": memberType,
    };

    if (clubId) {
      fields["Club"] = [clubId];
    }

    const created = await table.create([{ fields }]);
    const record = created[0];

    return NextResponse.json(
      {
        id: record.id,
        name: `${firstName} ${lastName}`,
        email: email.toLowerCase().trim(),
        role: "member",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
