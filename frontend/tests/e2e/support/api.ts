import { expect, type APIRequestContext, type APIResponse } from "@playwright/test";

import { apiUrl } from "../../../playwright.config";

export const API_BASE_URL = apiUrl;

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type District = {
  id: number;
  district_id: string;
  name: string;
};

export type Section = {
  id: number;
  section_id: string;
  name: string;
  district: number;
  district_name: string;
};

export type Pastor = {
  id: number;
  full_name: string;
  gender: "Male" | "Female";
  pastor_rank: "ArchBishop" | "Bishop" | "Presbyter" | "Reverend" | "Pastor";
  date_of_birth: string;
  phone_number: string;
  status: "active" | "retired" | "suspended" | "deceased";
};

export type Church = {
  id: number;
  church_name: string;
  section: number;
  section_name: string;
  location: string;
};

export type ChurchRole = {
  id: number;
  role_name: string;
};

export type ChurchPastor = {
  id: number;
  church: number;
  pastor: number;
  role: number;
};

type CreatePastorInput = {
  full_name: string;
  gender?: Pastor["gender"];
  pastor_rank?: Pastor["pastor_rank"];
  national_id?: string;
  date_of_birth?: string;
  phone_number: string;
  start_of_service?: string;
  status?: Pastor["status"];
};

async function expectOk<T>(responsePromise: Promise<APIResponse>): Promise<T> {
  const response = await responsePromise;
  expect(response.ok(), `${response.status()} ${response.statusText()}`).toBeTruthy();
  return response.json() as Promise<T>;
}

export function uniqueName(prefix: string) {
  return `${prefix} ${Date.now()} ${Math.random().toString(36).slice(2, 8)}`;
}

export function uniquePhone() {
  const suffix = String(Math.floor(Math.random() * 100_000_000)).padStart(8, "0");
  return `+2547${suffix}`;
}

export function e2eApi(request: APIRequestContext) {
  return {
    async list<T>(endpoint: string) {
      const response = await expectOk<T[] | PaginatedResponse<T>>(
        request.get(`${API_BASE_URL}${endpoint}`)
      );
      return Array.isArray(response) ? response : response.results;
    },

    async createDistrict(name = uniqueName("E2E District")) {
      return expectOk<District>(
        request.post(`${API_BASE_URL}/districts/`, {
          data: { name },
        })
      );
    },

    async deleteDistrict(id: number) {
      await request.delete(`${API_BASE_URL}/districts/${id}/`);
    },

    async createSection(district: number, name = uniqueName("E2E Section")) {
      return expectOk<Section>(
        request.post(`${API_BASE_URL}/sections/`, {
          data: { name, district },
        })
      );
    },

    async deleteSection(id: number) {
      await request.delete(`${API_BASE_URL}/sections/${id}/`);
    },

    async createPastor(input: CreatePastorInput) {
      return expectOk<Pastor>(
        request.post(`${API_BASE_URL}/pastors/`, {
          data: {
            full_name: input.full_name,
            gender: input.gender ?? "Male",
            pastor_rank: input.pastor_rank ?? "Pastor",
            national_id: input.national_id ?? String(Date.now()).slice(-8),
            date_of_birth: input.date_of_birth ?? "1970-01-01",
            phone_number: input.phone_number,
            start_of_service: input.start_of_service ?? "2000-01-01",
            status: input.status ?? "active",
          },
        })
      );
    },

    async deletePastor(id: number) {
      await request.delete(`${API_BASE_URL}/pastors/${id}/`);
    },

    async createChurch(section: number, church_name = uniqueName("E2E Church")) {
      return expectOk<Church>(
        request.post(`${API_BASE_URL}/churches/`, {
          data: {
            church_name,
            section,
            location: "E2E Test Location",
          },
        })
      );
    },

    async deleteChurch(id: number) {
      await request.delete(`${API_BASE_URL}/churches/${id}/`);
    },

    async createChurchRole(role_name = uniqueName("E2E Role")) {
      return expectOk<ChurchRole>(
        request.post(`${API_BASE_URL}/church-roles/`, {
          data: { role_name },
        })
      );
    },

    async deleteChurchRole(id: number) {
      await request.delete(`${API_BASE_URL}/church-roles/${id}/`);
    },

    async createAssignment(church: number, pastor: number, role: number) {
      return expectOk<ChurchPastor>(
        request.post(`${API_BASE_URL}/church-pastors/`, {
          data: { church, pastor, role },
        })
      );
    },

    async deleteAssignment(id: number) {
      await request.delete(`${API_BASE_URL}/church-pastors/${id}/`);
    },
  };
}
