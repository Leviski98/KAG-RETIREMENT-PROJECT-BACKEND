// Section type definitions
export interface Section {
  id: number;
  section_id: string;
  name: string;
  district: number;
  district_name: string;
  district_details?: {
    id: number;
    district_id: string;
    name: string;
    created_at: string;
    updated_at: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateSectionInput {
  name: string;
  district: number;
}

export interface UpdateSectionInput {
  name?: string;
  district?: number;
}

export interface SectionQueryParams {
  search?: string;
  district?: number;
  name?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface SectionStatistics {
  total_sections: number;
  sections_per_district: {
    district_name: string;
    count: number;
  }[];
  recent_sections: number;
}

export interface SectionSummary {
  section: Section;
  churches_count: number;
}
