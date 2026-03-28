import { createListHandler, createCreateHandler } from "@/lib/api-helpers";
import { validateNews } from "@/lib/validation";

export const GET = createListHandler("news");
export const POST = createCreateHandler("news", validateNews);
