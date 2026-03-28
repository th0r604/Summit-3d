import { createListHandler, createCreateHandler } from "@/lib/api-helpers";
import { validateClub } from "@/lib/validation";

export const GET = createListHandler("clubs");
export const POST = createCreateHandler("clubs", validateClub);
