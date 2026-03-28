import { createListHandler, createCreateHandler } from "@/lib/api-helpers";
import { validateCoach } from "@/lib/validation";

export const GET = createListHandler("coaches");
export const POST = createCreateHandler("coaches", validateCoach);
