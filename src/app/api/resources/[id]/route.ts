import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-helpers";
import { validateResource } from "@/lib/validation";

export const GET = createGetHandler("resources");
export const PATCH = createUpdateHandler("resources", validateResource);
export const DELETE = createDeleteHandler("resources");
