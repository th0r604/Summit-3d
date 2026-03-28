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
  people: "People",
  stripe: "STRIPE",
  athletes: "Athletes",
  managers: "Managers",
  coaches: "Coaches",
  technicalOfficials: "Technical Officials",
  clubs: "Clubs",
  events: "CFFF Events",
  rsvp: "RSVP",
  toTraining: "TO Training",
  workouts: "CFFF Workouts",
  news: "CFFF News",
  board: "CFFF Board",
  committees: "CFFF Assoc/Cmte",
  resources: "CFFF Resources",
  memberships: "CFFF Memberships",
  surveys: "CFFF Surveys",
  inventory: "Inventory",
  courses: "Courses",
} as const;

export type TableKey = keyof typeof TABLE_NAMES;

export function getTable(tableKey: TableKey) {
  return base(TABLE_NAMES[tableKey]);
}

export { base };
