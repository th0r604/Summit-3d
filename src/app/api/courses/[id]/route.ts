import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-helpers";
import { validateCourse } from "@/lib/validation";

export const GET = createGetHandler("courses");
export const PATCH = createUpdateHandler("courses", validateCourse);
export const DELETE = createDeleteHandler("courses");
