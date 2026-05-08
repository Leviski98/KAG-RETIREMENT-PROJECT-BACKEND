import { Section } from "@/types/section";

export const mockSections: Section[] = [
  {
    id: "SEC018",
    section_name: "Ahero Section",
    district: "DIS001",
    district_name: "Kisumu Lakeside District",
    churches_count: 7,
    created_at: "2024-02-15T10:00:00Z",
    updated_at: "2024-02-15T10:00:00Z",
  },
  {
    id: "SEC037",
    section_name: "Athi River Section",
    district: "DIS002",
    district_name: "Machakos Eastern District",
    churches_count: 6,
    created_at: "2024-03-10T10:00:00Z",
    updated_at: "2024-03-10T10:00:00Z",
  },
  {
    id: "SEC075",
    section_name: "Awendo Section",
    district: "DIS003",
    district_name: "Migori South Nyanza District",
    churches_count: 6,
    created_at: "2024-06-01T10:00:00Z",
    updated_at: "2024-06-01T10:00:00Z",
  },
  {
    id: "SEC014",
    section_name: "Bamburi Section",
    district: "DIS004",
    district_name: "Mombasa Coastal District",
    churches_count: 6,
    created_at: "2024-02-15T10:00:00Z",
    updated_at: "2024-02-15T10:00:00Z",
  },
  {
    id: "SEC042",
    section_name: "Baringo Section",
    district: "DIS005",
    district_name: "Baringo Rift Valley District",
    churches_count: 5,
    created_at: "2024-03-20T10:00:00Z",
    updated_at: "2024-03-20T10:00:00Z",
  },
];

export const getMockSection = (id: string): Section | undefined => {
  return mockSections.find((section) => section.id === id);
};

export const getMockSectionsByDistrict = (districtId: string): Section[] => {
  return mockSections.filter((section) => section.district === districtId);
};
