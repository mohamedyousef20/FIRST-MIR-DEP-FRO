import React from 'react';
import { apiService } from '@/lib/api/apiService';
import { toast } from 'sonner';

interface CashPaymentProps {
  orderId: string;
  totalAmount: number;
  onClose: () => void;
}

const CashPayment: React.FC<CashPaymentProps> = ({ orderId, totalAmount, onClose }) => {
  const [loading, setLoading] = React.useState(false);

  const handlePayment = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await apiService.post('/orders/update-payment', {
        orderId,
        paymentMethod: 'cash',
        totalAmount
      });

      toast.success('Order created successfully');
      onClose();
    } catch (error) {
      toast.error('Payment failed');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Cash Payment</h2>
        
        <div className="space-y-4 mb-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Order Details</h3>
            <p className="text-gray-700">Total Amount: EGP {totalAmount.toFixed(2)}</p>
            <p className="text-gray-700">Payment Method: Cash on Delivery</p>
          </div>

          <div className="text-gray-600">
            <p>Payment will be collected when the order is delivered.</p>
            <p>Please have exact change ready.</p>
          </div>
        </div>

        <button
          onClick={handlePayment}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Confirm Order'}
        </button>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CashPayment;
