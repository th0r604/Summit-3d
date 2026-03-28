import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-helpers";
import { validateCoach } from "@/lib/validation";

export const GET = createGetHandler("coaches");
export const PATCH = createUpdateHandler("coaches", validateCoach);
export const DELETE = createDeleteHandler("coaches");
