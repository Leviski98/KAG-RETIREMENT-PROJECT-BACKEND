import { District } from '@/types/district';

export const mockDistricts: District[] = [
  {
    id: '1',
    district_name: 'Nairobi District',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    district_name: 'Mombasa District',
    created_at: '2024-01-16T11:00:00Z',
    updated_at: '2024-01-16T11:00:00Z',
  },
  {
    id: '3',
    district_name: 'Kisumu District',
    created_at: '2024-01-17T09:45:00Z',
    updated_at: '2024-01-17T09:45:00Z',
  },
  {
    id: '4',
    district_name: 'Nakuru District',
    created_at: '2024-01-18T14:20:00Z',
    updated_at: '2024-01-18T14:20:00Z',
  },
  {
    id: '5',
    district_name: 'Eldoret District',
    created_at: '2024-01-19T08:15:00Z',
    updated_at: '2024-01-19T08:15:00Z',
  },
];

export const getMockDistrict = (id: string): District | undefined => {
  return mockDistricts.find((district) => district.id === id);
};
