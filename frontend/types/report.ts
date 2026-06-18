export type ReportMetric = {
  label: string;
  value: string;
};

export type DistrictSummaryReport = {
  title: string;
  generated_at: string;
  totals: {
    districts: number;
    sections: number;
    churches: number;
    assigned_pastors: number;
  };
  metrics: ReportMetric[];
  districts: Array<{
    district_id: string;
    district_name: string;
    sections: number;
    churches: number;
    assigned_pastors: number;
  }>;
};

export type PastorDemographicsReport = {
  title: string;
  generated_at: string;
  totals: {
    total_pastors: number;
    active_pastors: number;
    retired_pastors: number;
    average_years_served: number;
  };
  metrics: ReportMetric[];
  by_gender: Array<{ label: string; count: number }>;
  by_rank: Array<{ label: string; count: number }>;
  by_status: Array<{ label: string; count: number }>;
  districts: Array<{
    district_id: string;
    district_name: string;
    sections: Array<{
      section_id: string;
      section_name: string;
      pastors: Array<{
        pastor_id: string;
        name: string;
        rank: string;
        status: string;
        age: number | null;
        years_served: number | null;
        projected_retirement: string;
        remaining_tenure: string;
      }>;
    }>;
  }>;
};

export type ReportType = "district-summary" | "pastor-demographics";
