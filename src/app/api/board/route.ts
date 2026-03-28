import { createListHandler, createCreateHandler } from "@/lib/api-helpers";
import { validateBoard } from "@/lib/validation";

export const GET = createListHandler("board");
export const POST = createCreateHandler("board", validateBoard);
