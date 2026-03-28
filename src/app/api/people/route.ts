import { createListHandler, createCreateHandler } from "@/lib/api-helpers";
import { validatePerson } from "@/lib/validation";

export const GET = createListHandler("people");
export const POST = createCreateHandler("people", validatePerson);
