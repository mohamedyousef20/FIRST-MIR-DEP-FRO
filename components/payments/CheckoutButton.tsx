import { Button } from "@/components/ui/button";
import { usePaymobCheckout } from "@/hooks/usePaymobCheckout";

interface CheckoutButtonProps {
  orderId: string;
  totalAmount: number; // in EGP e.g., 250.75
  label?: string;
}

export function CheckoutButton({ orderId, totalAmount, label = "Pay Now" }: CheckoutButtonProps) {
  const { openCheckout, loading } = usePaymobCheckout({ orderId, amount: totalAmount });

  return (
    <Button onClick={openCheckout} disabled={loading}>
      {loading ? "Loading..." : label}
    </Button>
  );
}
