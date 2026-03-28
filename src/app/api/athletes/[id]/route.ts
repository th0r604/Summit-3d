import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-helpers";
import { validateAthlete } from "@/lib/validation";

export const GET = createGetHandler("athletes");
export const PATCH = createUpdateHandler("athletes", validateAthlete);
export const DELETE = createDeleteHandler("athletes");
