timport { userSchemas } from './schema';
import { z } from 'zod';

// Test data
describe('User Validation Schemas', () => {
  // Register validation tests
  describe('Register Schema', () => {
    const validRegisterData = {
      firstName: 'محمد',
      lastName: 'أحمد',
      email: 'test@example.com',
      password: 'Password123',
      phone: '+966501234567',
      role: 'user'
    };

    it('should validate valid register data', async () => {
      const result = await userSchemas.register.safeParseAsync(validRegisterData);
      expect(result.success).toBe(true);
    });

    it('should fail with invalid email', async () => {
      const invalidData = { ...validRegisterData, email: 'invalid-email' };
      const result = await userSchemas.register.safeParseAsync(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.errors[0].message).toContain('البريد الإلكتروني غير صحيح');
    });

    it('should fail with short password', async () => {
      const invalidData = { ...validRegisterData, password: '123' };
      const result = await userSchemas.register.safeParseAsync(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.errors[0].message).toContain('كلمة المرور يجب أن تكون على الأقل 8 أحرف');
    });
  });

  // Login validation tests
  describe('Login Schema', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'Password123'
    };

    it('should validate valid login data', async () => {
      const result = await userSchemas.login.safeParseAsync(validLoginData);
      expect(result.success).toBe(true);
    });

    it('should fail with invalid email', async () => {
      const invalidData = { ...validLoginData, email: 'invalid-email' };
      const result = await userSchemas.login.safeParseAsync(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.errors[0].message).toContain('البريد الإلكتروني غير صحيح');
    });
  });
});
