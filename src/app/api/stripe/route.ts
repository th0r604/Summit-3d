import { createListHandler, createCreateHandler } from "@/lib/api-helpers";
import { validateStripe } from "@/lib/validation";

export const GET = createListHandler("stripe");
export const POST = createCreateHandler("stripe", validateStripe);
