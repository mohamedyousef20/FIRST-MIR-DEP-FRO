'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, QrCode } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

// ✅ تحميل مكتبة react-qr-scanner ديناميكيًا
const QrScanner = dynamic(() => import('react-qr-scanner'), {
  ssr: false,
  loading: () => (
    <div className="py-6 text-center text-sm text-muted-foreground">
      جاري تهيئة الماسح...
    </div>
  ),
});

type ApiResponse = {
  success: boolean;
  message?: string;
};

export default function DeliveryConfirmation() {
  const [orderId, setOrderId] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // socket
  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      withCredentials: true,
      transports: ['websocket'],
    });

    setSocket(socketInstance);

    socketInstance.on('delivery:confirmed', (data: { orderId: string; message: string }) => {
      if (data.orderId === orderId) {
        toast.success(`Order #${data.orderId}: ${data.message}`);
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [orderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedOrderId = orderId.trim();
    const trimmedSecretCode = secretCode.trim();

    if (!trimmedOrderId || !/^[a-fA-F0-9]{24}$/.test(trimmedOrderId)) {
      setMessage({ text: 'الرجاء إدخال معرف طلب صحيح (24 رمزًا)', isError: true });
      return;
    }

    if (!trimmedSecretCode || !/^\d{6,12}$/.test(trimmedSecretCode)) {
      setMessage({ text: 'الكود السري يجب أن يتكون من 6 إلى 12 رقمًا', isError: true });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/orders/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: trimmedOrderId, code: trimmedSecretCode }),
      });

      const data: ApiResponse = await response.json();

      if (response.ok && data.success) {
        setMessage({ text: 'تم تأكيد الطلب بنجاح ✅', isError: false });

        if (socket) {
          socket.emit('delivery:confirm', {
            orderId,
            message: 'تم تأكيد التسليم',
            timestamp: new Date().toISOString(),
          });
        }

        setOrderId('');
        setSecretCode('');
      } else {
        setMessage({ text: data.message || 'الكود غير صحيح أو الطلب غير موجود ❌', isError: true });
      }
    } catch (error) {
      setMessage({ text: 'حدث خطأ أثناء تأكيد الطلب', isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleScanner = () => {
    setShowScanner((prev) => !prev);
    setMessage(null);
  };

  const handleScanResult = (data: string | null) => {
    if (!data) return;

    try {
      const parsed = JSON.parse(data);
      if (parsed?.orderId && parsed?.secretCode) {
        setOrderId(parsed.orderId);
        setSecretCode(parsed.secretCode);
        setShowScanner(false);
        setMessage({ text: 'تمت قراءة الرمز بنجاح، يمكنك الآن تأكيد التسليم ✅', isError: false });
      } else {
        setMessage({ text: 'الرمز لا يحتوي على بيانات طلب صالحة', isError: true });
      }
    } catch {
      setMessage({ text: 'تعذر قراءة محتوى الرمز. حاول مرة أخرى.', isError: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">تأكيد تسليم الطلب</CardTitle>
          <CardDescription className="text-gray-500">
            يرجى إدخال بيانات الطلب لتأكيد التسليم
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Order ID */}
            <div className="space-y-2">
              <Label htmlFor="orderId">رقم الطلب</Label>
              <Input
                id="orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="مثال: 65f1c8..."
                disabled={isLoading}
                className="text-center text-lg h-12"
              />
            </div>

            {/* Secret Code */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="secretCode">الكود السري</Label>

                <button
                  type="button"
                  onClick={toggleScanner}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <QrCode className="h-4 w-4" />
                  {showScanner ? 'إخفاء الماسح' : 'مسح الكود'}
                </button>
              </div>

              <Input
                id="secretCode"
                type="password"
                maxLength={12}
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value.replace(/\D/g, ''))}
                placeholder="أدخل الكود"
                disabled={isLoading}
                className="text-center text-xl tracking-widest h-14"
              />

              {/* Scanner */}
              {showScanner && (
                <div className="mt-4 rounded-xl border bg-muted/30 p-3">
                  {QrScanner ? (
                    <QrScanner
                      delay={300}
                      style={{ width: '100%' }}
                      onError={(err) => //console.log(err)}
                        onScan = { handleScanResult }
                        />
                  ) : (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      جاري تحميل الماسح...
                    </div>
                  )}

                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    وجه الكاميرا نحو رمز QR
                  </p>
                </div>
              )}
            </div>

            {/* Messages */}
            {message && (
              <div
                className={`p-3 rounded-md text-center ${message.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}
              >
                {message.text}
              </div>
            )}

            {/* Submit */}
            <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جاري المعالجة...
                </>
              ) : (
                'تأكيد التسليم'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
