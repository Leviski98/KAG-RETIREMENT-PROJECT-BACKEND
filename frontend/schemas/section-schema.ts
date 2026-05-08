import { z } from 'zod';

export const sectionSchema = z.object({
  section_name: z
    .string()
    .min(2, 'Section name must be at least 2 characters')
    .max(100, 'Section name must not exceed 100 characters'),
  district: z.string().min(1, 'District is required'),
});

export type SectionFormData = z.infer<typeof sectionSchema>;
