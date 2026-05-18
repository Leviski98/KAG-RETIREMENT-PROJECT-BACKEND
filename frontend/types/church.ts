export interface Church {
  id: string;
  name: string;
  location: string;
  section: string;
  pastorCount: number;
  createdAt: string;
}

export type SortField = "name" | "location" | "createdAt";

export interface ChurchFormData {
  name: string;
  section: string;
  location: string;
}

export interface ChurchRole {
  id: string;
  name: string;
  assignments: number;
}

export interface ChurchRoleFormData {
  name: string;
}

export type PastorTitle = "Archbishop" | "Bishop" | "Presbyter" | "Reverend" | "Pastor";

export interface Pastor {
  id: string;
  name: string;
  title: PastorTitle;
}

export interface PastorAssignment {
  id: string;
  churchId: string;
  churchName: string;
  pastorId: string;
  pastorName: string;
  pastorTitle: PastorTitle;
  role: string;
  assignedDate: string;
}

export interface PastorAssignmentFormData {
  churchId: string;
  pastorId: string;
  role: string;
}
