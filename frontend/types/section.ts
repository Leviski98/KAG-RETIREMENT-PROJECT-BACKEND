// Section type definitions
export interface Section {
  id: string;
  section_name: string;
  district: string;
  district_name?: string;
  churches_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSectionInput {
  section_name: string;
  district: string;
}

export interface UpdateSectionInput {
  section_name?: string;
  district?: string;
}

export interface SectionListResponse {
  results: Section[];
  count: number;
  next: string | null;
  previous: string | null;
}
