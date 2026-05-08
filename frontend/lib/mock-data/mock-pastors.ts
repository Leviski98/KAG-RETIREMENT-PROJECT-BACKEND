import { Pastor } from "@/types/pastor";

export const mockPastors: Pastor[] = [
  {
    id: "PAS001",
    full_name: "Rev. James Kamau",
    rank: "Reverend",
    date_of_birth: "1958-03-15T00:00:00Z",
    status: "active",
    phone_number: "+254712345001",
    email: "james.kamau@kag.org",
    years_of_service: 33,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "PAS002",
    full_name: "Bishop Peter Ochieng",
    rank: "Bishop",
    date_of_birth: "1950-07-20T00:00:00Z",
    status: "active",
    phone_number: "+254712345002",
    email: "peter.ochieng@kag.org",
    years_of_service: 41,
    created_at: "2024-01-16T11:00:00Z",
    updated_at: "2024-01-16T11:00:00Z",
  },
  {
    id: "PAS003",
    full_name: "Pastor Mary Wanjiku",
    rank: "Pastor",
    date_of_birth: "1965-11-10T00:00:00Z",
    status: "suspended",
    phone_number: "+254712345003",
    email: "mary.wanjiku@kag.org",
    years_of_service: 28,
    created_at: "2024-01-17T09:45:00Z",
    updated_at: "2024-01-17T09:45:00Z",
  },
  {
    id: "PAS004",
    full_name: "Presbyter David Mutua",
    rank: "Presbyter",
    date_of_birth: "1970-04-25T00:00:00Z",
    status: "active",
    phone_number: "+254712345004",
    email: "david.mutua@kag.org",
    years_of_service: 22,
    created_at: "2024-01-18T14:20:00Z",
    updated_at: "2024-01-18T14:20:00Z",
  },
  {
    id: "PAS005",
    full_name: "Rev. Sarah Akinyi",
    rank: "Reverend",
    date_of_birth: "1960-09-05T00:00:00Z",
    status: "suspended",
    phone_number: "+254712345005",
    email: "sarah.akinyi@kag.org",
    years_of_service: 30,
    created_at: "2024-01-19T08:15:00Z",
    updated_at: "2024-01-19T08:15:00Z",
  },
  {
    id: "PAS006",
    full_name: "Bishop John Mwangi",
    rank: "Bishop",
    date_of_birth: "1955-12-12T00:00:00Z",
    status: "retired",
    retirement_date: "2023-12-31T00:00:00Z",
    phone_number: "+254712345006",
    email: "john.mwangi@kag.org",
    years_of_service: 38,
    created_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-01-20T10:00:00Z",
  },
  {
    id: "PAS007",
    full_name: "Pastor Grace Njeri",
    rank: "Pastor",
    date_of_birth: "1968-06-18T00:00:00Z",
    status: "active",
    phone_number: "+254712345007",
    email: "grace.njeri@kag.org",
    years_of_service: 25,
    created_at: "2024-01-21T11:30:00Z",
    updated_at: "2024-01-21T11:30:00Z",
  },
  {
    id: "PAS008",
    full_name: "Rev. Thomas Kipchoge",
    rank: "Reverend",
    date_of_birth: "1962-02-28T00:00:00Z",
    status: "deceased",
    phone_number: "+254712345008",
    email: "thomas.kipchoge@kag.org",
    years_of_service: 31,
    created_at: "2024-01-22T09:00:00Z",
    updated_at: "2024-01-22T09:00:00Z",
  },
  {
    id: "PAS009",
    full_name: "Presbyter Ruth Wambui",
    rank: "Presbyter",
    date_of_birth: "1972-08-14T00:00:00Z",
    status: "deceased",
    phone_number: "+254712345009",
    email: "ruth.wambui@kag.org",
    years_of_service: 20,
    created_at: "2024-01-23T10:45:00Z",
    updated_at: "2024-01-23T10:45:00Z",
  },
  {
    id: "PAS010",
    full_name: "Pastor Michael Otieno",
    rank: "Pastor",
    date_of_birth: "1966-10-30T00:00:00Z",
    status: "retired",
    retirement_date: "2024-03-31T00:00:00Z",
    phone_number: "+254712345010",
    email: "michael.otieno@kag.org",
    years_of_service: 27,
    created_at: "2024-01-24T08:30:00Z",
    updated_at: "2024-01-24T08:30:00Z",
  },
];

export const getMockPastor = (id: string): Pastor | undefined => {
  return mockPastors.find((pastor) => pastor.id === id);
};

export const getMockPastorsByStatus = (status: string): Pastor[] => {
  if (status === "all") return mockPastors;
  return mockPastors.filter((pastor) => pastor.status === status);
};

export const getMockPastorsByRank = (rank: string): Pastor[] => {
  if (rank === "all") return mockPastors;
  return mockPastors.filter((pastor) => pastor.rank === rank);
};

export const getPastorStats = () => {
  const total = mockPastors.length;
  const active = mockPastors.filter((p) => p.status === "active").length;
  const retired = mockPastors.filter((p) => p.status === "retired").length;
  const suspended = mockPastors.filter((p) => p.status === "suspended").length;
  const deceased = mockPastors.filter((p) => p.status === "deceased").length;

  return { total, active, retired, suspended, deceased };
};

export const getPastorRankStats = () => {
  const reverend = mockPastors.filter((p) => p.rank === "Reverend").length;
  const bishop = mockPastors.filter((p) => p.rank === "Bishop").length;
  const pastor = mockPastors.filter((p) => p.rank === "Pastor").length;
  const presbyter = mockPastors.filter((p) => p.rank === "Presbyter").length;

  return { reverend, bishop, pastor, presbyter };
};
