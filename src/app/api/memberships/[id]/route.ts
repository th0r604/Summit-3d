import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-helpers";
import { validateMembership } from "@/lib/validation";

export const GET = createGetHandler("memberships");
export const PATCH = createUpdateHandler("memberships", validateMembership);
export const DELETE = createDeleteHandler("memberships");
