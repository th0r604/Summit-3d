import Airtable from "airtable";

if (!process.env.AIRTABLE_API_KEY) {
  throw new Error("AIRTABLE_API_KEY is not set in environment variables");
}
if (!process.env.AIRTABLE_BASE_ID) {
  throw new Error("AIRTABLE_BASE_ID is not set in environment variables");
}

const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY });
const base = airtable.base(process.env.AIRTABLE_BASE_ID);

export const TABLE_NAMES = {
  members: process.env.AIRTABLE_TABLE_MEMBERS || "Members",
  athletes: process.env.AIRTABLE_TABLE_ATHLETES || "Athletes",
  clubs: process.env.AIRTABLE_TABLE_CLUBS || "Clubs",
  events: process.env.AIRTABLE_TABLE_EVENTS || "Events",
  volunteers: process.env.AIRTABLE_TABLE_VOLUNTEERS || "Volunteers",
  technicalOfficials: process.env.AIRTABLE_TABLE_TOS || "Technical Officials",
  toTraining: process.env.AIRTABLE_TABLE_TO_TRAINING || "TO Training",
  toExperience: process.env.AIRTABLE_TABLE_TO_EXPERIENCE || "TO Experience",
} as const;

export type TableKey = keyof typeof TABLE_NAMES;

export function getTable(tableKey: TableKey) {
  return base(TABLE_NAMES[tableKey]);
}

export { base };
