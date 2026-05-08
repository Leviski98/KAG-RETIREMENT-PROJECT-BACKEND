// Pastor type definitions
export type PastorStatus = 'active' | 'retired' | 'suspended' | 'deceased';
export type PastorRank = 'Reverend' | 'Bishop' | 'Pastor' | 'Presbyter';

export interface Pastor {
  id: string;
  full_name: string;
  rank: PastorRank;
  date_of_birth: string;
  status: PastorStatus;
  retirement_date?: string;
  phone_number?: string;
  email?: string;
  years_of_service?: number;
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
