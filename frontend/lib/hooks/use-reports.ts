import { useMutation } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import { reportApi } from "@/lib/api";
import type { ReportRange } from "@/types/report";

export const reportKeys = {
  all: ["reports"] as const,
  districtSummary: (range: ReportRange) =>
    [...reportKeys.all, "district-summary", range] as const,
  pastorDemographics: (range: ReportRange) =>
    [...reportKeys.all, "pastor-demographics", range] as const,
};

export function useDistrictSummaryReport(enabled = false, range: ReportRange = "all") {
  return useQuery({
    queryKey: reportKeys.districtSummary(range),
    queryFn: () => reportApi.getDistrictSummary(range),
    enabled,
  });
}

export function usePastorDemographicsReport(enabled = false, range: ReportRange = "all") {
  return useQuery({
    queryKey: reportKeys.pastorDemographics(range),
    queryFn: () => reportApi.getPastorDemographics(range),
    enabled,
  });
}

export function useDownloadDistrictSummaryPDF() {
  return useMutation({
    mutationFn: reportApi.downloadDistrictSummaryPDF,
  });
}

export function useDownloadPastorDemographicsPDF() {
  return useMutation({
    mutationFn: reportApi.downloadPastorDemographicsPDF,
  });
}
