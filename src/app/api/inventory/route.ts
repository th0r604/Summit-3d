import { createListHandler, createCreateHandler } from "@/lib/api-helpers";
import { validateInventory } from "@/lib/validation";

export const GET = createListHandler("inventory");
export const POST = createCreateHandler("inventory", validateInventory);
