import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-helpers";
import { validateStripe } from "@/lib/validation";

export const GET = createGetHandler("stripe");
export const PATCH = createUpdateHandler("stripe", validateStripe);
export const DELETE = createDeleteHandler("stripe");
