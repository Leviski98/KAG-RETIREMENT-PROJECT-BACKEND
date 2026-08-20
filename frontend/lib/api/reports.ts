import { apiClient, API_BASE_URL } from "@/lib/api/client";
import type {
  DistrictSummaryReport,
  PastorDemographicsReport,
  ReportRange,
} from "@/types/report";

const downloadPDF = async (url: string, filename: string) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Failed to download PDF: ${response.statusText}`);
  }

  const blob = await response.blob();
  const urlObj = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = urlObj;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(urlObj);
};

export const reportApi = {
  getDistrictSummary: (range: ReportRange = "all") =>
    apiClient.get<DistrictSummaryReport>(
      `/reports/district-summary/?range=${range}`
    ),

  getPastorDemographics: (range: ReportRange = "all") =>
    apiClient.get<PastorDemographicsReport>(
      `/reports/pastor-demographics/?range=${range}`
    ),

  downloadDistrictSummaryPDF: (range: ReportRange = "all") =>
    downloadPDF(
      `/reports/district-summary/pdf/?range=${range}`,
      "District_Summary_Report.pdf"
    ),

  downloadPastorDemographicsPDF: (range: ReportRange = "all") =>
    downloadPDF(
      `/reports/pastor-demographics/pdf/?range=${range}`,
      "Pastor_Demographics_Report.pdf"
    ),
};
