// Pastor type definitions
export type PastorStatus = 'active' | 'retired' | 'deceased';

export interface Pastor {
  id: string;
  full_name: string;
  date_of_birth: string;
  status: PastorStatus;
  retirement_date?: string;
  phone_number?: string;
  email?: string;
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
