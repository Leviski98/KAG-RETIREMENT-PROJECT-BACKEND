// District type definitions
export interface District {
  id: string;
  district_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDistrictInput {
  district_name: string;
}

export interface UpdateDistrictInput {
  district_name?: string;
}

export interface DistrictListResponse {
  results: District[];
  count: number;
  next: string | null;
  previous: string | null;
}
