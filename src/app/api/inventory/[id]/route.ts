import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-helpers";
import { validateInventory } from "@/lib/validation";

export const GET = createGetHandler("inventory");
export const PATCH = createUpdateHandler("inventory", validateInventory);
export const DELETE = createDeleteHandler("inventory");
