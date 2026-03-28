import { createListHandler, createCreateHandler } from "@/lib/api-helpers";
import { validateSurvey } from "@/lib/validation";

export const GET = createListHandler("surveys");
export const POST = createCreateHandler("surveys", validateSurvey);
