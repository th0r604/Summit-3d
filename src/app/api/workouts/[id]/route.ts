import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-helpers";
import { validateWorkout } from "@/lib/validation";

export const GET = createGetHandler("workouts");
export const PATCH = createUpdateHandler("workouts", validateWorkout);
export const DELETE = createDeleteHandler("workouts");
