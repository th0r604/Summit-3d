// Canadian provinces
export type Province = "AB" | "BC" | "MB" | "NB" | "NL" | "NS" | "NT" | "NU" | "ON" | "PE" | "QC" | "SK" | "YT";

export interface MemberFields {
  "First Name": string;
  "Last Name": string;
  "Email": string;
  "Phone"?: string;
  "Date of Birth"?: string;
  "Province"?: Province;
  "City"?: string;
  "Membership Status": "Active" | "Expired" | "Pending" | "Suspended";
  "Membership Type": "Athlete" | "Coach" | "General" | "Lifetime";
  "Membership Start"?: string;
  "Membership Expiry"?: string;
  "Notes"?: string;
}

export interface AthleteFields {
  "Member": string[]; // linked record IDs
  "Club"?: string[]; // linked record IDs
  "Division": "Individual" | "Team" | "Adaptive";
  "Age Category": "Teen (14-15)" | "Junior (16-17)" | "Open (18-34)" | "Masters 35-39" | "Masters 40-44" | "Masters 45-49" | "Masters 50-54" | "Masters 55-59" | "Masters 60+";
  "Gender Category": "Male" | "Female" | "Non-Binary";
  "Competition Status": "Active" | "Inactive" | "Banned";
  "Qualification Level"?: "Regional" | "Provincial" | "National" | "International";
  "Notes"?: string;
}

export interface ClubFields {
  "Club Name": string;
  "Affiliate Number"?: string;
  "Province"?: Province;
  "City"?: string;
  "Address"?: string;
  "Contact Name"?: string;
  "Contact Email"?: string;
  "Contact Phone"?: string;
  "Website"?: string;
  "Affiliation Status": "Active" | "Expired" | "Pending";
  "Affiliation Date"?: string;
  "Notes"?: string;
}

export interface EventFields {
  "Event Name": string;
  "Event Type": "Competition" | "Seminar" | "Workshop" | "AGM" | "Social";
  "Start Date"?: string;
  "End Date"?: string;
  "Location"?: string;
  "Province"?: Province;
  "Status": "Planned" | "Open Registration" | "In Progress" | "Completed" | "Cancelled";
  "Description"?: string;
  "Max Participants"?: number;
  "Notes"?: string;
}

export interface VolunteerFields {
  "Member": string[]; // linked record IDs
  "Event": string[]; // linked record IDs
  "Role": "Registration Desk" | "Floor Manager" | "Scorekeeper" | "Announcer" | "Setup/Teardown" | "General" | "Other";
  "Status": "Assigned" | "Confirmed" | "Completed" | "No-Show";
  "Hours"?: number;
  "Notes"?: string;
}

export interface TechnicalOfficialFields {
  "Member": string[]; // linked record IDs
  "Certification Level": "Level 1" | "Level 2" | "Level 3" | "Head Judge" | "Senior Official";
  "Certification Date"?: string;
  "Certification Expiry"?: string;
  "Certification Status": "Active" | "Expired" | "Suspended";
  "Notes"?: string;
}

export interface TOTrainingFields {
  "Training Name": string;
  "Course Type": "Level 1 Cert" | "Level 2 Cert" | "Level 3 Cert" | "Recertification" | "Rules Update" | "Practical Exam";
  "Date"?: string;
  "Location"?: string;
  "Instructor"?: string;
  "Technical Official": string[]; // linked record IDs
  "Result": "Pass" | "Fail" | "Incomplete" | "Audit";
  "Certificate Number"?: string;
  "Notes"?: string;
}

export interface TOExperienceFields {
  "Technical Official": string[]; // linked record IDs
  "Event": string[]; // linked record IDs
  "Role at Event": "Head Judge" | "Judge" | "Scorekeeper" | "Timer" | "Video Reviewer";
  "Performance Rating"?: number;
  "Notes"?: string;
}

// Generic record wrapper
export interface AirtableRecord<T = Record<string, unknown>> {
  id: string;
  fields: T;
  createdTime: string;
}

// API response types
export interface ListResponse<T> {
  records: AirtableRecord<T>[];
}

export interface ErrorResponse {
  error: string;
}
