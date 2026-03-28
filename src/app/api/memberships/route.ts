import { createListHandler, createCreateHandler } from "@/lib/api-helpers";
import { validateMembership } from "@/lib/validation";

export const GET = createListHandler("memberships");
export const POST = createCreateHandler("memberships", validateMembership);
