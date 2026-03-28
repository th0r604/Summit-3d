import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-helpers";
import { validateNews } from "@/lib/validation";

export const GET = createGetHandler("news");
export const PATCH = createUpdateHandler("news", validateNews);
export const DELETE = createDeleteHandler("news");
