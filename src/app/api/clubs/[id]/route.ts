import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-helpers";
import { validateClub } from "@/lib/validation";

export const GET = createGetHandler("clubs");
export const PATCH = createUpdateHandler("clubs", validateClub);
export const DELETE = createDeleteHandler("clubs");
