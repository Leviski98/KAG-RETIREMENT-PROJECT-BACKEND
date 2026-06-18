import { useMutation } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import { reportApi } from "@/lib/api";

export const reportKeys = {
  all: ["reports"] as const,
  districtSummary: () => [...reportKeys.all, "district-summary"] as const,
  pastorDemographics: () => [...reportKeys.all, "pastor-demographics"] as const,
};

export function useDistrictSummaryReport(enabled = false) {
  return useQuery({
    queryKey: reportKeys.districtSummary(),
    queryFn: reportApi.getDistrictSummary,
    enabled,
  });
}

export function usePastorDemographicsReport(enabled = false) {
  return useQuery({
    queryKey: reportKeys.pastorDemographics(),
    queryFn: reportApi.getPastorDemographics,
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
