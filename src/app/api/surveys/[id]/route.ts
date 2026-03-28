import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-helpers";
import { validateSurvey } from "@/lib/validation";

export const GET = createGetHandler("surveys");
export const PATCH = createUpdateHandler("surveys", validateSurvey);
export const DELETE = createDeleteHandler("surveys");
