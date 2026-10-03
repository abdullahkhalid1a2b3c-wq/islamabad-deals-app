import { z } from 'zod';

export const REPORT_REASONS = [
  'Wrong price',
  'Deal expired',
  'Restaurant closed',
  'Misleading',
  'Other',
] as const;

export type ReportReason = typeof REPORT_REASONS[number];

export const reportSchema = z.object({
  reason: z.enum(REPORT_REASONS, {
    errorMap: () => ({ message: 'Please select a valid reason' }),
  }),
  note: z
    .string()
    .max(300, 'Note must not exceed 300 characters')
    .optional()
    .or(z.literal('')),
});

export type ReportFormValues = z.infer<typeof reportSchema>;
