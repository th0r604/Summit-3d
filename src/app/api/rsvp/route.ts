import { createListHandler, createCreateHandler } from "@/lib/api-helpers";
import { validateRsvp } from "@/lib/validation";

export const GET = createListHandler("rsvp");
export const POST = createCreateHandler("rsvp", validateRsvp);
