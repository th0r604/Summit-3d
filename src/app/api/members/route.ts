import { createListHandler, createCreateHandler } from "@/lib/api-helpers";
import { validateMember } from "@/lib/validation";

export const GET = createListHandler("members");
export const POST = createCreateHandler("members", validateMember);
