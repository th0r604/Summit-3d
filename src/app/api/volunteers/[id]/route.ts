import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-helpers";
import { validateVolunteer } from "@/lib/validation";

export const GET = createGetHandler("volunteers");
export const PATCH = createUpdateHandler("volunteers", validateVolunteer);
export const DELETE = createDeleteHandler("volunteers");
