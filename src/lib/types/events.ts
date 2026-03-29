export type EventType = "Competition" | "Seminar" | "Workshop" | "Training Camp" | "Social" | "Other";

export type SanctionLevel = "CF3 Sanctioned" | "Community" | "International" | "Provincial" | "Other";

export type EventStatus = "Draft" | "Pending Approval" | "Open Registration" | "Closed" | "In Progress" | "Completed" | "Cancelled";

export type AttendanceStatus = "Registered" | "Confirmed" | "Attended" | "No-Show";

export type RsvpRole = "Athlete" | "Technical Official" | "Volunteer" | "Parent/Guardian";

export const EVENT_TYPES: EventType[] = ["Competition", "Seminar", "Workshop", "Training Camp", "Social", "Other"];

export const SANCTION_LEVELS: SanctionLevel[] = ["CF3 Sanctioned", "Community", "International", "Provincial", "Other"];

export const EVENT_STATUSES: EventStatus[] = ["Draft", "Pending Approval", "Open Registration", "Closed", "In Progress", "Completed", "Cancelled"];

export const ATTENDANCE_STATUSES: AttendanceStatus[] = ["Registered", "Confirmed", "Attended", "No-Show"];

export const RSVP_ROLES: RsvpRole[] = ["Athlete", "Technical Official", "Volunteer", "Parent/Guardian"];

export const PROVINCES = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"] as const;
