import { useCallback, useState } from 'react';
import { paymentService } from '@/lib/api';
import { loadPaymobCheckoutScript } from '@/utils/loadPaymobScript';

interface UsePaymobCheckoutOptions {
  /** Order ID in your DB */
  orderId: string;
  /** Amount in **base currency units** (e.g., 100.50 EGP) */
  amount: number;
  /** Optional callback when checkout finishes (webhook will still be source-of-truth) */
  onClose?: () => void;
}

export function usePaymobCheckout({ orderId, amount, onClose }: UsePaymobCheckoutOptions) {
  const [loading, setLoading] = useState(false);

  const openCheckout = useCallback(async () => {
    try {
      setLoading(true);

      // 1) Load Paymob script (idempotent)
      await loadPaymobCheckoutScript();

      // 2) Create payment session (your backend signs it with PAYMENT_SECRET_KEY)
      const { data } = await paymentService.createPaymentSession({ amount, orderId });
      const paymentToken = data.payment_token || data.paymentKey || data.token;

      if (!(window as any).Accept || !paymentToken) {
        throw new Error('Paymob SDK or token unavailable');
      }

      // 3) Open Paymob Unified Checkout modal
      (window as any).Accept.checkout(paymentToken, {
        onClose: () => {
          onClose?.();
        },
      });
    } catch (err) {
      console.error('Paymob checkout error:', err);
    } finally {
      setLoading(false);
    }
  }, [amount, orderId, onClose]);

  return { openCheckout, loading };
}
