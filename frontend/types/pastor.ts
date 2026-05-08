export type PastorStatus = "active" | "retired" | "suspended" | "deceased";

export type PastorRank =
  | "Reverend"
  | "Bishop"
  | "Pastor"
  | "Presbyter";

export interface Pastor {
  id: string;
  full_name: string;
  rank: PastorRank;
  role?: string;
  date_of_birth: string;
  age?: number;
  status: PastorStatus;
  retirement_date?: string | null;
  phone_number?: string;
  email?: string;
  national_id?: string;
  years_of_service?: number;
  projected_retirement?: string;
  remaining_tenure?: number;
  created_at: string;
  updated_at: string;
}
