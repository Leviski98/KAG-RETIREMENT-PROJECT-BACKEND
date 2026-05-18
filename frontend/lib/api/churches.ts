import { PASTOR_RANK_MAP } from "@/constants/pastor-status";
import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse } from "@/lib/api/client";
import type { Church, ChurchRole, PastorAssignment } from "@/types/church";

interface ApiChurch {
  id: number;
  church_name: string;
  section: number;
  section_name: string;
  location: string;
  pastor_count: number;
  created_at: string;
}

interface ApiChurchRole {
  id: number;
  role_name: string;
  assignments: number;
}

interface ApiChurchPastor {
  id: number;
  church: number;
  church_name: string;
  pastor: number;
  pastor_name: string;
  pastor_rank: string;
  role: number;
  role_name: string;
  created_at: string;
}

export interface ApiSection {
  id: number;
  name: string;
}

export interface ApiPastor {
  id: number;
  full_name: string;
  pastor_rank: string;
}

export interface ChurchWriteInput {
  sectionId: number;
  name: string;
  location: string;
}

export interface RoleWriteInput {
  name: string;
}

export interface AssignmentWriteInput {
  churchId: string;
  pastorId: string;
  roleId: string;
}

type ListResponse<T> = T[] | PaginatedResponse<T>;

function listResults<T>(data: ListResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results;
}

function toChurch(api: ApiChurch): Church {
  return {
    id: String(api.id),
    name: api.church_name,
    location: api.location,
    section: api.section_name,
    pastorCount: api.pastor_count,
    createdAt: api.created_at.split("T")[0],
  };
}

function toRole(api: ApiChurchRole): ChurchRole {
  return {
    id: String(api.id),
    name: api.role_name,
    assignments: api.assignments,
  };
}

function toAssignment(api: ApiChurchPastor): PastorAssignment {
  return {
    id: String(api.id),
    churchId: String(api.church),
    churchName: api.church_name,
    pastorId: String(api.pastor),
    pastorName: api.pastor_name,
    pastorTitle: PASTOR_RANK_MAP[api.pastor_rank] ?? "Pastor",
    role: api.role_name,
    assignedDate: new Date(api.created_at).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  };
}

export const churchApi = {
  getChurches: async (): Promise<Church[]> => {
    const data = await apiClient.get<ListResponse<ApiChurch>>("/churches/");
    return listResults(data).map(toChurch);
  },

  createChurch: async (input: ChurchWriteInput): Promise<Church> => {
    const data = await apiClient.post<ApiChurch>("/churches/", {
      section: input.sectionId,
      church_name: input.name,
      location: input.location,
    });
    return toChurch(data);
  },

  updateChurch: async (
    id: string,
    input: ChurchWriteInput
  ): Promise<Church> => {
    const data = await apiClient.patch<ApiChurch>(`/churches/${id}/`, {
      section: input.sectionId,
      church_name: input.name,
      location: input.location,
    });
    return toChurch(data);
  },

  deleteChurch: (id: string) => apiClient.delete(`/churches/${id}/`),

  getRoles: async (): Promise<ChurchRole[]> => {
    const data = await apiClient.get<ListResponse<ApiChurchRole>>("/church-roles/");
    return listResults(data).map(toRole);
  },

  createRole: async (input: RoleWriteInput): Promise<ChurchRole> => {
    const data = await apiClient.post<ApiChurchRole>("/church-roles/", {
      role_name: input.name,
    });
    return toRole(data);
  },

  updateRole: async (
    id: string,
    input: RoleWriteInput
  ): Promise<ChurchRole> => {
    const data = await apiClient.patch<ApiChurchRole>(`/church-roles/${id}/`, {
      role_name: input.name,
    });
    return toRole(data);
  },

  deleteRole: (id: string) => apiClient.delete(`/church-roles/${id}/`),

  getAssignments: async (): Promise<PastorAssignment[]> => {
    const data = await apiClient.get<ListResponse<ApiChurchPastor>>("/church-pastors/");
    return listResults(data).map(toAssignment);
  },

  createAssignment: async (
    input: AssignmentWriteInput
  ): Promise<PastorAssignment> => {
    const data = await apiClient.post<ApiChurchPastor>("/church-pastors/", {
      church: Number(input.churchId),
      pastor: Number(input.pastorId),
      role: Number(input.roleId),
    });
    return toAssignment(data);
  },

  deleteAssignment: (id: string) =>
    apiClient.delete(`/church-pastors/${id}/`),

  getSections: async () => {
    const data = await apiClient.get<ListResponse<ApiSection>>("/sections/");
    return listResults(data);
  },

  getPastors: async () => {
    const data = await apiClient.get<ListResponse<ApiPastor>>("/pastors/");
    return listResults(data);
  },
};
