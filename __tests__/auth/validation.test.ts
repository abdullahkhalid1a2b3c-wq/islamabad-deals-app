import { signUpSchema, signInSchema, pakistaniPhoneSchema } from '../../src/validation/auth';

describe('Auth Zod Validation Schemas', () => {
  describe('signUpSchema', () => {
    it('accepts valid sign up data', () => {
      const input = {
        fullName: 'Abdullah Khalid',
        email: 'abdullah@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        phone: '03001234567',
      };

      const result = signUpSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.phone).toBe('+923001234567');
      }
    });

    it('rejects passwords without numbers or under 8 chars', () => {
      const input = {
        fullName: 'Abdullah Khalid',
        email: 'abdullah@example.com',
        password: 'short',
        confirmPassword: 'short',
      };

      const result = signUpSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects non-matching confirmPassword', () => {
      const input = {
        fullName: 'Abdullah Khalid',
        email: 'abdullah@example.com',
        password: 'Password123',
        confirmPassword: 'Different123',
      };

      const result = signUpSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('pakistaniPhoneSchema', () => {
    it('normalizes 03XXXXXXXXX format to +923XXXXXXXXX', () => {
      const result = pakistaniPhoneSchema.safeParse('03459876543');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('+923459876543');
      }
    });

    it('normalizes 923XXXXXXXXX format to +923XXXXXXXXX', () => {
      const result = pakistaniPhoneSchema.safeParse('923459876543');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('+923459876543');
      }
    });

    it('accepts already normalized +923XXXXXXXXX', () => {
      const result = pakistaniPhoneSchema.safeParse('+923459876543');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('+923459876543');
      }
    });

    it('rejects invalid phone format e.g. 12345', () => {
      const result = pakistaniPhoneSchema.safeParse('12345');
      expect(result.success).toBe(false);
    });
  });
});
