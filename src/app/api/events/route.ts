import { createListHandler, createCreateHandler } from "@/lib/api-helpers";
import { validateEvent } from "@/lib/validation";

export const GET = createListHandler("events");
export const POST = createCreateHandler("events", validateEvent);
