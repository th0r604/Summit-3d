type ValidationResult = { valid: true } | { valid: false; errors: string[] };

function checkRequired(fields: Record<string, unknown>, required: string[]): string[] {
  return required
    .filter((key) => !fields[key] || (typeof fields[key] === "string" && (fields[key] as string).trim() === ""))
    .map((key) => `${key} is required`);
}

export function validateMember(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["First Name", "Last Name", "Email", "Membership Status", "Membership Type"]);
  if (fields["Email"] && typeof fields["Email"] === "string" && !fields["Email"].includes("@")) {
    errors.push("Email must be a valid email address");
  }
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateAthlete(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Member", "Division", "Age Category", "Gender Category", "Competition Status"]);
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateClub(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Club Name", "Affiliation Status"]);
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateEvent(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Event Name", "Event Type", "Status"]);
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateVolunteer(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Member", "Event", "Role", "Status"]);
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateTechnicalOfficial(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Member", "Certification Level", "Certification Status"]);
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateTOTraining(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Training Name", "Course Type", "Technical Official", "Result"]);
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateTOExperience(fields: Record<string, unknown>): ValidationResult {
  const errors = checkRequired(fields, ["Technical Official", "Event", "Role at Event"]);
  return errors.length ? { valid: false, errors } : { valid: true };
}
