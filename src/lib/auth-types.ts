export type UserRole = "if_admin" | "nf_admin" | "club_admin" | "member";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clubId?: string;
  countryId?: string;
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  if_admin: 4,
  nf_admin: 3,
  club_admin: 2,
  member: 1,
};

export function hasMinRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export const ROLE_LABELS: Record<UserRole, string> = {
  if_admin: "International Federation",
  nf_admin: "National Federation",
  club_admin: "Club Admin",
  member: "Member",
};
