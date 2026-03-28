import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-helpers";
import { validateEvent } from "@/lib/validation";

export const GET = createGetHandler("events");
export const PATCH = createUpdateHandler("events", validateEvent);
export const DELETE = createDeleteHandler("events");
