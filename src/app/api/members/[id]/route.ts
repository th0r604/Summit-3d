import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-helpers";
import { validateMember } from "@/lib/validation";

export const GET = createGetHandler("members");
export const PATCH = createUpdateHandler("members", validateMember);
export const DELETE = createDeleteHandler("members");
