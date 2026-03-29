type ValidationResult = { valid: true } | { valid: false; errors: string[] };

function checkRequired(fields: Record<string, unknown>, required: string[]): string[] {
  return required
    .filter((key) => !fields[key] || (typeof fields[key] === "string" && (fields[key] as string).trim() === ""))
    .map((key) => `${key} is required`);
}

export function validatePerson(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["First Name", "Last Name", "Email"]);
  if (fields["Email"] && typeof fields["Email"] === "string" && !fields["Email"].includes("@")) {
    errors.push("Email must be a valid email address");
  }
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateAthlete(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Name"]);
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateManager(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Name"]);
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateCoach(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Name"]);
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateClub(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Club Name"]);
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateEvent(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Event Name"]);
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateRsvp(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Name"]);
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateTechnicalOfficial(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Name"]);
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateTOTraining(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Training Name"]);
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateWorkout(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Name"]);
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateNews(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Title"]);
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateBoard(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Name"]);
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateCommittee(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Name"]);
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateResource(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Name"]);
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateMembership(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Name"]);
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateSurvey(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Name"]);
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateStripe(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Name"]);
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateInventory(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Name"]);
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateCourse(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Name"]);
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateEventCreate(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Event Name", "Event Type", "Start Date"]);
  if (fields["End Date"] && fields["Start Date"]) {
    const start = new Date(String(fields["Start Date"]));
    const end = new Date(String(fields["End Date"]));
    if (end < start) {
      errors.push("End Date must be after Start Date");
    }
  }
  if (fields["Max Participants"] && Number(fields["Max Participants"]) < 1) {
    errors.push("Max Participants must be a positive number");
  }
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateAttendance(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Event", "Person", "Role"]);
  const validRoles = ["Athlete", "Technical Official", "Volunteer", "Parent/Guardian"];
  if (fields["Role"] && !validRoles.includes(String(fields["Role"]))) {
    errors.push("Role must be one of: " + validRoles.join(", "));
  }
  return errors.length ? { valid: false, errors } : { valid: true };
}
