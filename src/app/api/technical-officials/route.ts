import { createListHandler, createCreateHandler } from "@/lib/api-helpers";
import { validateTechnicalOfficial } from "@/lib/validation";

export const GET = createListHandler("technicalOfficials");
export const POST = createCreateHandler("technicalOfficials", validateTechnicalOfficial);
