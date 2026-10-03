import { z } from 'zod';

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const fullNameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(60, 'Name cannot exceed 60 characters')
  .trim();

export const pakistaniPhoneSchema = z
  .string()
  .optional()
  .or(z.literal(''))
  .transform((val) => {
    if (!val || val.trim() === '') return undefined;
    const clean = val.replace(/[\s-]/g, '');
    if (clean.startsWith('03')) {
      return `+92${clean.slice(1)}`;
    }
    if (clean.startsWith('923')) {
      return `+${clean}`;
    }
    return clean;
  })
  .pipe(
    z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          return /^\+923\d{9}$/.test(val);
        },
        {
          message:
            'Phone number must be a valid Pakistani number (e.g. 03001234567 or +923001234567)',
        },
      ),
  );

export const signUpSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    phone: pakistaniPhoneSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const profileUpdateSchema = z.object({
  fullName: fullNameSchema,
  phone: pakistaniPhoneSchema,
  avatarUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
