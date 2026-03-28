export type UserRole = "nf_admin" | "club_admin" | "member";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clubId?: string;
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  nf_admin: 3,
  club_admin: 2,
  member: 1,
};

export function hasMinRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export const ROLE_LABELS: Record<UserRole, string> = {
  nf_admin: "Federation Admin",
  club_admin: "Club Admin",
  member: "Member",
};
