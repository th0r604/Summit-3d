import { createListHandler, createCreateHandler } from "@/lib/api-helpers";
import { validateCommittee } from "@/lib/validation";

export const GET = createListHandler("committees");
export const POST = createCreateHandler("committees", validateCommittee);
