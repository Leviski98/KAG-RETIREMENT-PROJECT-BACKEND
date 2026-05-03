import { z } from 'zod';

export const pastorSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(200, 'Full name must not exceed 200 characters'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  status: z.enum(['active', 'retired', 'deceased'], {
    required_error: 'Status is required',
  }),
  retirement_date: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

export type PastorFormData = z.infer<typeof pastorSchema>;
