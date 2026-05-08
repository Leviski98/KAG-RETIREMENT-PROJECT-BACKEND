import { Pastor } from "@/types/pastor";

export const mockPastors: Pastor[] = [
  {
    id: "PAS001",
    full_name: "James Kamau",
    rank: "Reverend",
    role: "Senior Pastor",
    date_of_birth: "1958-03-15T00:00:00Z",
    age: 68,
    status: "active",
    phone_number: "+254712345001",
    email: "james.kamau@kag.org",
    national_id: "12345678",
    years_of_service: 33,
    projected_retirement: "Jun 2040",
    remaining_tenure: 15,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "PAS002",
    full_name: "Peter Ochieng",
    rank: "Bishop",
    role: "District Overseer",
    date_of_birth: "1950-07-20T00:00:00Z",
    age: 76,
    status: "active",
    phone_number: "+254712345002",
    email: "peter.ochieng@kag.org",
    national_id: "23456789",
    years_of_service: 41,
    projected_retirement: "Mar 2030",
    remaining_tenure: 5,
    created_at: "2024-01-16T11:00:00Z",
    updated_at: "2024-01-16T11:00:00Z",
  },
  {
    id: "PAS003",
    full_name: "Mary Wanjiku",
    rank: "Pastor",
    role: "Children's Minister",
    date_of_birth: "1965-11-10T00:00:00Z",
    age: 61,
    status: "suspended",
    phone_number: "+254712345003",
    email: "mary.wanjiku@kag.org",
    national_id: "34567890",
    years_of_service: 28,
    projected_retirement: "Nov 2050",
    remaining_tenure: 25,
    created_at: "2024-01-17T09:45:00Z",
    updated_at: "2024-01-17T09:45:00Z",
  },
  {
    id: "PAS004",
    full_name: "David Mutua",
    rank: "Presbyter",
    role: "Associate Pastor",
    date_of_birth: "1970-04-25T00:00:00Z",
    age: 56,
    status: "active",
    phone_number: "+254712345004",
    email: "david.mutua@kag.org",
    national_id: "45678901",
    years_of_service: 22,
    projected_retirement: "Sep 2044",
    remaining_tenure: 19,
    created_at: "2024-01-18T14:20:00Z",
    updated_at: "2024-01-18T14:20:00Z",
  },
  {
    id: "PAS005",
    full_name: "Sarah Akinyi",
    rank: "Reverend",
    role: "Church Elder",
    date_of_birth: "1960-09-05T00:00:00Z",
    age: 66,
    status: "suspended",
    phone_number: "+254712345005",
    email: "sarah.akinyi@kag.org",
    national_id: "56789012",
    years_of_service: 30,
    projected_retirement: "Jan 2029",
    remaining_tenure: 8,
    created_at: "2024-01-19T08:15:00Z",
    updated_at: "2024-01-19T08:15:00Z",
  },
  {
    id: "PAS006",
    full_name: "John Mwangi",
    rank: "Bishop",
    role: "Regional Bishop",
    date_of_birth: "1955-12-12T00:00:00Z",
    age: 71,
    status: "retired",
    retirement_date: "2023-12-31T00:00:00Z",
    phone_number: "+254712345006",
    email: "john.mwangi@kag.org",
    national_id: "67890123",
    years_of_service: 38,
    projected_retirement: "Dec 2023",
    remaining_tenure: 0,
    created_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-01-20T10:00:00Z",
  },
  {
    id: "PAS007",
    full_name: "Grace Njeri",
    rank: "Pastor",
    role: "Youth Pastor",
    date_of_birth: "1968-06-18T00:00:00Z",
    age: 58,
    status: "active",
    phone_number: "+254712345007",
    email: "grace.njeri@kag.org",
    national_id: "78901234",
    years_of_service: 25,
    projected_retirement: "Jul 2057",
    remaining_tenure: 32,
    created_at: "2024-01-21T11:30:00Z",
    updated_at: "2024-01-21T11:30:00Z",
  },
  {
    id: "PAS008",
    full_name: "Thomas Kipchoge",
    rank: "Reverend",
    role: "Evangelism Pastor",
    date_of_birth: "1962-02-28T00:00:00Z",
    age: 64,
    status: "deceased",
    phone_number: "+254712345008",
    email: "thomas.kipchoge@kag.org",
    national_id: "89012345",
    years_of_service: 31,
    projected_retirement: "Dec 2033",
    remaining_tenure: 8,
    created_at: "2024-01-22T09:00:00Z",
    updated_at: "2024-01-22T09:00:00Z",
  },
  {
    id: "PAS009",
    full_name: "Ruth Wambui",
    rank: "Presbyter",
    role: "Worship Pastor",
    date_of_birth: "1972-08-14T00:00:00Z",
    age: 54,
    status: "deceased",
    phone_number: "+254712345009",
    email: "ruth.wambui@kag.org",
    national_id: "90123456",
    years_of_service: 20,
    projected_retirement: "May 2052",
    remaining_tenure: 27,
    created_at: "2024-01-23T10:45:00Z",
    updated_at: "2024-01-23T10:45:00Z",
  },
  {
    id: "PAS010",
    full_name: "Michael Otieno",
    rank: "Pastor",
    role: "General Overseer",
    date_of_birth: "1966-10-30T00:00:00Z",
    age: 60,
    status: "retired",
    retirement_date: "2024-03-31T00:00:00Z",
    phone_number: "+254712345010",
    email: "michael.otieno@kag.org",
    national_id: "01234567",
    years_of_service: 27,
    projected_retirement: "Aug 2025",
    remaining_tenure: 0,
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
