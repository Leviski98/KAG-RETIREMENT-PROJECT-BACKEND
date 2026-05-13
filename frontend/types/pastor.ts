// Pastor type definitions
export type PastorStatus = 'active' | 'retired' | 'suspended' | 'deceased';
export type PastorRank = 'Archbishop' | 'Bishop' | 'Presbyter' | 'Reverend' | 'Pastor';

export interface Pastor {
  id: string;
  full_name: string;
  rank: PastorRank;
  role?: string;
  date_of_birth: string;
  age?: number;
  status: PastorStatus;
  retirement_date?: string;
  phone_number?: string;
  email?: string;
  national_id?: string;
  years_of_service?: number;
  projected_retirement?: string;
  remaining_tenure?: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePastorInput {
  full_name: string;
  date_of_birth: string;
  status: PastorStatus;
  retirement_date?: string;
  phone_number?: string;
  email?: string;
}

export interface UpdatePastorInput {
  full_name?: string;
  date_of_birth?: string;
  status?: PastorStatus;
  retirement_date?: string;
  phone_number?: string;
  email?: string;
}

export interface PastorListResponse {
  results: Pastor[];
  count: number;
  next: string | null;
  previous: string | null;
}
