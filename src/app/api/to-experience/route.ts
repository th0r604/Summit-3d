import { createListHandler, createCreateHandler } from "@/lib/api-helpers";
import { validateTOExperience } from "@/lib/validation";

export const GET = createListHandler("toExperience");
export const POST = createCreateHandler("toExperience", validateTOExperience);
