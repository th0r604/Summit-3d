import { createListHandler, createCreateHandler } from "@/lib/api-helpers";
import { validateVolunteer } from "@/lib/validation";

export const GET = createListHandler("volunteers");
export const POST = createCreateHandler("volunteers", validateVolunteer);
