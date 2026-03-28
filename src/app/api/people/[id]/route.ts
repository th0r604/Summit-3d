import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-helpers";
import { validatePerson } from "@/lib/validation";

export const GET = createGetHandler("people");
export const PATCH = createUpdateHandler("people", validatePerson);
export const DELETE = createDeleteHandler("people");
