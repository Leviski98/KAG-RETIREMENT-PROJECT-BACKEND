import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface PastorStats {
  total_pastors: number;
  active_pastors: number;
  retired_pastors: number;
  pastors_by_rank: Array<{ pastor_rank: string; count: number }>;
  pastors_by_status: Array<{ status: string; count: number }>;
}

interface DistrictStats {
  total_districts: number;
  recent_districts: number;
}

interface SectionStats {
  total_sections: number;
  recent_sections: number;
}

interface Church {
  id: number;
  church_name: string;
  location: string;
  section: number;
  created_at: string;
}

interface ChurchPastor {
  id: number;
  church: Church;
  pastor: { id: number; full_name: string };
  role: { id: number; role_name: string };
  created_at: string;
}

export function usePastorStats() {
  return useQuery({
    queryKey: ["pastorStats"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/pastors/statistics/`);
      if (!response.ok) throw new Error("Failed to fetch pastor statistics");
      return response.json() as Promise<PastorStats>;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
  });
}

export function useDistrictStats() {
  return useQuery({
    queryKey: ["districtStats"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/districts/statistics/`);
      if (!response.ok) throw new Error("Failed to fetch district statistics");
      return response.json() as Promise<DistrictStats>;
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
}

export function useSectionStats() {
  return useQuery({
    queryKey: ["sectionStats"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/sections/statistics/`);
      if (!response.ok) throw new Error("Failed to fetch section statistics");
      return response.json() as Promise<SectionStats>;
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
}

export function useChurches() {
  return useQuery({
    queryKey: ["churches"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/churches/`);
      if (!response.ok) throw new Error("Failed to fetch churches");
      return response.json() as Promise<{ results: Church[] }>;
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
}

export function useChurchPastors() {
  return useQuery({
    queryKey: ["churchPastors"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/church-pastors/?limit=5`);
      if (!response.ok) throw new Error("Failed to fetch recent activities");
      return response.json() as Promise<{ results: ChurchPastor[] }>;
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
}

// Hook to invalidate dashboard queries (call this after adding/updating data)
export function useInvalidateDashboard() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: ["pastorStats"] });
      queryClient.invalidateQueries({ queryKey: ["districtStats"] });
      queryClient.invalidateQueries({ queryKey: ["sectionStats"] });
      queryClient.invalidateQueries({ queryKey: ["churches"] });
      queryClient.invalidateQueries({ queryKey: ["churchPastors"] });
    },
    invalidatePastors: () => {
      queryClient.invalidateQueries({ queryKey: ["pastorStats"] });
      queryClient.invalidateQueries({ queryKey: ["churchPastors"] });
    },
    invalidateDistricts: () => {
      queryClient.invalidateQueries({ queryKey: ["districtStats"] });
    },
    invalidateSections: () => {
      queryClient.invalidateQueries({ queryKey: ["sectionStats"] });
    },
  };
}
