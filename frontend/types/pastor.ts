// Pastor type definitions matching Django backend
export type PastorStatus = 'active' | 'retired' | 'suspended' | 'deceased';
export type PastorRank = 'ArchBishop' | 'Bishop' | 'Presbyter' | 'Reverend' | 'Pastor';
export type PastorGender = 'Male' | 'Female';

export interface Pastor {
  id: number;
  pastor_id: string; // Computed field like "PAS001"
  full_name: string;
  gender: PastorGender;
  pastor_rank: PastorRank;
  national_id: string | null;
  date_of_birth: string;
  phone_number: string;
  start_of_service: string | null;
  status: PastorStatus;
  created_at: string;
  updated_at: string;
}

export interface CreatePastorInput {
  full_name: string;
  gender: PastorGender;
  pastor_rank: PastorRank;
  national_id?: string;
  date_of_birth: string;
  phone_number: string;
  start_of_service?: string;
  status?: PastorStatus;
}

export interface UpdatePastorInput {
  full_name?: string;
  gender?: PastorGender;
  pastor_rank?: PastorRank;
  national_id?: string;
  date_of_birth?: string;
  phone_number?: string;
  start_of_service?: string;
  status?: PastorStatus;
}

export interface PastorQueryParams {
  search?: string;
  pastor_rank?: PastorRank;
  status?: PastorStatus;
  gender?: PastorGender;
  ordering?: string;
  page?: number;
}

export interface PastorStatistics {
  total_pastors: number;
  recent_pastors: number;
  active_pastors: number;
  retired_pastors: number;
  pastors_by_rank: Array<{ pastor_rank: PastorRank; count: number }>;
  pastors_by_status: Array<{ status: PastorStatus; count: number }>;
  pastors_by_gender: Array<{ gender: PastorGender; count: number }>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PastorSummary extends Pastor {
  // Additional summary fields can be added here when backend provides them
}

export interface ActivePastorsResponse {
  count: number;
  pastors: Pastor[];
}

export interface RetiredPastorsResponse {
  count: number;
  pastors: Pastor[];
}
