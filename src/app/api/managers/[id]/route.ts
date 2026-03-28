import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-helpers";
import { validateManager } from "@/lib/validation";

export const GET = createGetHandler("managers");
export const PATCH = createUpdateHandler("managers", validateManager);
export const DELETE = createDeleteHandler("managers");
