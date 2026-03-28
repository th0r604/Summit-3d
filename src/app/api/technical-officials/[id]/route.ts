import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-helpers";
import { validateTechnicalOfficial } from "@/lib/validation";

export const GET = createGetHandler("technicalOfficials");
export const PATCH = createUpdateHandler("technicalOfficials", validateTechnicalOfficial);
export const DELETE = createDeleteHandler("technicalOfficials");
