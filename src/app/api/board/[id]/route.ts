import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-helpers";
import { validateBoard } from "@/lib/validation";

export const GET = createGetHandler("board");
export const PATCH = createUpdateHandler("board", validateBoard);
export const DELETE = createDeleteHandler("board");
