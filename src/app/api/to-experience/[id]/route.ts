import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-helpers";
import { validateTOExperience } from "@/lib/validation";

export const GET = createGetHandler("toExperience");
export const PATCH = createUpdateHandler("toExperience", validateTOExperience);
export const DELETE = createDeleteHandler("toExperience");
