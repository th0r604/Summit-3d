import { createListHandler, createCreateHandler } from "@/lib/api-helpers";
import { validateResource } from "@/lib/validation";

export const GET = createListHandler("resources");
export const POST = createCreateHandler("resources", validateResource);
