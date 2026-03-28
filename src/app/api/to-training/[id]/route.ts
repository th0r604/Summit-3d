import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-helpers";
import { validateTOTraining } from "@/lib/validation";

export const GET = createGetHandler("toTraining");
export const PATCH = createUpdateHandler("toTraining", validateTOTraining);
export const DELETE = createDeleteHandler("toTraining");
