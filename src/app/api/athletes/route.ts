import { createListHandler, createCreateHandler } from "@/lib/api-helpers";
import { validateAthlete } from "@/lib/validation";

export const GET = createListHandler("athletes");
export const POST = createCreateHandler("athletes", validateAthlete);
