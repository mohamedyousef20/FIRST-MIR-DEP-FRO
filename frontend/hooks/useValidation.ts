import { useState } from 'react';
import { userSchemas } from '@/lib/validation/schema';
import { z } from 'zod';

export const useValidation = (type: 'register' | 'login' | 'profile' | 'updateProfile') => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = async (data: any) => {
    try {
      const schema = userSchemas[type];
      const result = await schema.safeParseAsync(data);
      
      if (!result.success) {
        const validationErrors: { [key: string]: string } = {};
        result.error.errors.forEach((error: z.ZodIssue) => {
          validationErrors[error.path[0]] = error.message;
        });
        setErrors(validationErrors);
        
        // Show first error message
        if (result.error.errors.length > 0) {
          console.error('Validation error:', result.error.errors[0].message);
        }
        
        return false;
      }
      
      setErrors({});
      return true;
    } catch (err: any) {
      console.error('Validation error:', err);
      toast.error('حدث خطأ أثناء التحقق من صحة البيانات');
      return false;
    }
  };

  return { errors, validate };
};
