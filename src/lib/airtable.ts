import Airtable from "airtable";

if (!process.env.AIRTABLE_API_KEY) {
  throw new Error("AIRTABLE_API_KEY is not set in environment variables");
}
if (!process.env.AIRTABLE_BASE_ID) {
  throw new Error("AIRTABLE_BASE_ID is not set in environment variables");
}

const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY });
const base = airtable.base(process.env.AIRTABLE_BASE_ID);

export function getTable(tableName?: string) {
  const name = tableName || process.env.AIRTABLE_TABLE_NAME;
  if (!name) {
    throw new Error("No table name provided and AIRTABLE_TABLE_NAME is not set");
  }
  return base(name);
}

export { base };
