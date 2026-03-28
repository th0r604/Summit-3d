export type Province = "AB" | "BC" | "MB" | "NB" | "NL" | "NS" | "NT" | "NU" | "ON" | "PE" | "QC" | "SK" | "YT";

// Generic record wrapper
export interface AirtableRecord<T = Record<string, unknown>> {
  id: string;
  fields: T;
  createdTime: string;
}

export interface ListResponse<T = Record<string, unknown>> {
  records: AirtableRecord<T>[];
}

export interface ErrorResponse {
  error: string;
  details?: string[];
}
