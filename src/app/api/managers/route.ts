import { createListHandler, createCreateHandler } from "@/lib/api-helpers";
import { validateManager } from "@/lib/validation";

export const GET = createListHandler("managers");
export const POST = createCreateHandler("managers", validateManager);
