import { createListHandler, createCreateHandler } from "@/lib/api-helpers";
import { validateTOTraining } from "@/lib/validation";

export const GET = createListHandler("toTraining");
export const POST = createCreateHandler("toTraining", validateTOTraining);
