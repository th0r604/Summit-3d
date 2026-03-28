import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-helpers";
import { validateCommittee } from "@/lib/validation";

export const GET = createGetHandler("committees");
export const PATCH = createUpdateHandler("committees", validateCommittee);
export const DELETE = createDeleteHandler("committees");
