import { NextRequest, NextResponse } from "next/server";
import { getTable, TableKey } from "./airtable";

type ValidationResult = { valid: true } | { valid: false; errors: string[] };
type ValidateFn = (fields: Record<string, unknown>) => ValidationResult;

export function createListHandler(tableKey: TableKey) {
  return async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const search = searchParams.get("search");
      const table = getTable(tableKey);

      const options: Record<string, unknown> = {};
      if (search) {
        options.filterByFormula = `SEARCH(LOWER("${search.replace(/"/g, '\\"')}"), LOWER(ARRAYJOIN(RECORD_ID())))`;
      }

      const records = await table.select(options).all();
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
  };
}

export function createCreateHandler(tableKey: TableKey, validate?: ValidateFn) {
  return async function POST(request: NextRequest) {
    try {
      const body = await request.json();
      const { fields } = body;

      if (!fields || typeof fields !== "object") {
        return NextResponse.json({ error: "fields object is required" }, { status: 400 });
      }

      if (validate) {
        const result = validate(fields);
        if (!result.valid) {
          return NextResponse.json({ error: "Validation failed", details: result.errors }, { status: 400 });
        }
      }

      const table = getTable(tableKey);
      const created = await table.create([{ fields }]);
      const record = created[0];

      return NextResponse.json({
        id: record.id,
        fields: record.fields,
        createdTime: record._rawJson.createdTime,
      }, { status: 201 });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create record";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
}

export function createGetHandler(tableKey: TableKey) {
  return async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params;
      const table = getTable(tableKey);
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
  };
}

export function createUpdateHandler(tableKey: TableKey, validate?: ValidateFn) {
  return async function PATCH(
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

      if (validate) {
        const result = validate(fields);
        if (!result.valid) {
          return NextResponse.json({ error: "Validation failed", details: result.errors }, { status: 400 });
        }
      }

      const table = getTable(tableKey);
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
  };
}

export function createDeleteHandler(tableKey: TableKey) {
  return async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params;
      const table = getTable(tableKey);
      await table.destroy(id);

      return NextResponse.json({ deleted: true, id });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete record";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
}
