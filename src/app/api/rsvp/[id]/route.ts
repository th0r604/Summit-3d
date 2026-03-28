import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-helpers";
import { validateRsvp } from "@/lib/validation";

export const GET = createGetHandler("rsvp");
export const PATCH = createUpdateHandler("rsvp", validateRsvp);
export const DELETE = createDeleteHandler("rsvp");
