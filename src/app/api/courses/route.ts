import { createListHandler, createCreateHandler } from "@/lib/api-helpers";
import { validateCourse } from "@/lib/validation";

export const GET = createListHandler("courses");
export const POST = createCreateHandler("courses", validateCourse);
