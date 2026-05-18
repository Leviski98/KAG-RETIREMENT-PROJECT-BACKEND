// District type definitions
export interface District {
  id: number;
  district_id: string; // e.g., "DIS001"
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDistrictInput {
  name: string;
}

export interface UpdateDistrictInput {
  name?: string;
}

export interface DistrictStatistics {
  total_districts: number;
  recent_districts: number;
  oldest_district: string | null;
  newest_district: string | null;
}

export interface DistrictSummary {
  district: District;
}

export interface BulkCreateDistrictInput {
  districts: CreateDistrictInput[];
}

export interface DistrictQueryParams {
  search?: string;
  ordering?: string;
  name?: string;
  page?: number;
  page_size?: number;
}
