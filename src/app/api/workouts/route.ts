import { createListHandler, createCreateHandler } from "@/lib/api-helpers";
import { validateWorkout } from "@/lib/validation";

export const GET = createListHandler("workouts");
export const POST = createCreateHandler("workouts", validateWorkout);
