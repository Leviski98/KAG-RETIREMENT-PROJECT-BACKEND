import { z } from 'zod';

export const districtSchema = z.object({
  district_name: z
    .string()
    .min(2, 'District name must be at least 2 characters')
    .max(100, 'District name must not exceed 100 characters'),
});

export type DistrictFormData = z.infer<typeof districtSchema>;
