import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { resetPasswordRequest } from '@/src/redux/slices/userSlice';
import { userService } from '@/lib/api';

const schema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
});

export interface PasswordResetState {
  isLoading: boolean;
  error: string | null;
}

export const usePasswordReset = () => {
  const router = useRouter();
  const [state, setState] = useState<PasswordResetState>({
    isLoading: false,
    error: null,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await userService.forgotPassword(data.email);
      if (response.error) {
        throw new Error(response.error.message || 'حدث خطأ أثناء إرسال الطلب');
      }

      toast.success('تم إرسال كود التحقق إلى بريدك الإلكتروني');
      router.push('/auth/password-reset-verify');
    } catch (error) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'حدث خطأ غير معروف' }));
      toast.error(state.error || 'حدث خطأ غير معروف');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    ...state,
  };
};
