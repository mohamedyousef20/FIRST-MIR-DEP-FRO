'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, QrCode } from 'lucide-react';
import io from 'socket.io-client';
import { toast } from 'sonner';

// ✅ تحميل مكتبة react-qr-scanner ديناميكيًا مع fallback
const QrScanner = dynamic(() => import('react-qr-scanner').then(mod => mod), {
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
  const [socket, setSocket] = useState<any>(null);
  const [isScannerReady, setIsScannerReady] = useState(false);

  // useRef لحفظ آخر QR code تم مسحه لتجنب المعالجة المتكررة
  const lastScannedCode = useRef<string>('');

  // ✅ تهيئة Socket
  useEffect(() => {
    const socketInstance = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
      {
        transports: ['websocket'],
      }
    );

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('✅ Connected to socket server');
    });

    socketInstance.on('delivery:confirmed', (data: { orderId: string; message: string }) => {
      toast.success(`طلب #${data.orderId}: ${data.message}`);
    });

    socketInstance.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

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
        body: JSON.stringify({
          id: trimmedOrderId,
          code: trimmedSecretCode
        }),
      });

      const data: ApiResponse = await response.json();

      if (response.ok && data.success) {
        setMessage({
          text: data.message || 'تم تأكيد الطلب بنجاح ✅',
          isError: false
        });

        if (socket) {
          socket.emit('delivery:confirm', {
            orderId: trimmedOrderId,
            message: 'تم تأكيد التسليم',
            timestamp: new Date().toISOString(),
          });
        }

        // ✅ Reset form
        setOrderId('');
        setSecretCode('');
        lastScannedCode.current = ''; // Reset last scanned code

        // Auto-clear success message after 5 seconds
        setTimeout(() => {
          setMessage(null);
        }, 5000);
      } else {
        setMessage({
          text: data.message || 'الكود غير صحيح أو الطلب غير موجود ❌',
          isError: true
        });
      }
    } catch (error: any) {
      console.error('Error confirming delivery:', error);
      setMessage({
        text: 'حدث خطأ أثناء تأكيد الطلب. يرجى المحاولة مرة أخرى.',
        isError: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleScanner = () => {
    setShowScanner((prev) => !prev);
    setMessage(null);
    setIsScannerReady(false);
  };

  const handleScanResult = (result: any) => {
    if (!result || !result.text) return;

    const scannedText = result.text;

    // تجنب معالجة نفس QR code عدة مرات
    if (scannedText === lastScannedCode.current) {
      return;
    }

    lastScannedCode.current = scannedText;

    try {
      let parsed;

      // محاولة تحويل JSON إذا كان النص يحتوي على JSON
      if (scannedText.startsWith('{') && scannedText.endsWith('}')) {
        parsed = JSON.parse(scannedText);
      } else {
        // إذا لم يكن JSON، نحاول تقسيمه حسب فاصلة أو نقطتين
        const parts = scannedText.split(/[:,]/).map((part: string) => part.trim());
        if (parts.length >= 2) {
          parsed = {
            orderId: parts[0],
            secretCode: parts[1]
          };
        } else {
          throw new Error('Invalid format');
        }
      }

      if (parsed?.orderId && parsed?.secretCode) {
        setOrderId(parsed.orderId);
        setSecretCode(parsed.secretCode);
        setShowScanner(false);
        setMessage({
          text: 'تمت قراءة الرمز بنجاح، يمكنك الآن تأكيد التسليم ✅',
          isError: false
        });

        // Auto-clear message after 3 seconds
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      } else {
        setMessage({
          text: 'الرمز لا يحتوي على بيانات طلب صالحة',
          isError: true
        });
      }
    } catch (error: any) {
      console.error('Error parsing QR code:', error);
      setMessage({
        text: 'تعذر قراءة محتوى الرمز. تأكد من أن الرمز يحتوي على بيانات الطلب.',
        isError: true
      });
    }
  };

  const handleScanError = (error: any) => {
    console.error('QR Scanner Error:', error);
    if (!isScannerReady) setIsScannerReady(true);
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
                placeholder="مثال: 65f1c8a3e4b5d6f7a8b9c0d1"
                disabled={isLoading}
                className="text-center text-lg h-12 font-mono"
                dir="ltr"
              />
            </div>

            {/* Secret Code */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="secretCode">الكود السري</Label>

                <button
                  type="button"
                  onClick={toggleScanner}
                  disabled={isLoading}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <QrCode className="h-4 w-4" />
                  {showScanner ? 'إخفاء الماسح' : 'مسح الكود'}
                </button>
              </div>

              <Input
                id="secretCode"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={12}
                value={secretCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 12) {
                    setSecretCode(value);
                  }
                }}
                placeholder="أدخل الكود السري (6-12 رقم)"
                disabled={isLoading}
                className="text-center text-xl tracking-widest h-14 font-mono"
                dir="ltr"
              />

              {/* Scanner */}
              {showScanner && (
                <div className="mt-4 rounded-xl border bg-muted/30 p-3">
                  <div className="relative overflow-hidden rounded-lg">
                    {typeof window !== 'undefined' && (
                      <QrScanner
                        delay={500}
                        constraints={{
                          video: {
                            facingMode: 'environment'
                          }
                        }}
                        onError={handleScanError}
                        onScan={handleScanResult}
                        style={{
                          width: '100%',
                          aspectRatio: '1/1',
                          objectFit: 'cover'
                        }}
                      />
                    )}

                    {/* Overlay guidance */}
                    <div className="absolute inset-0 border-2 border-blue-400 rounded-lg m-2 pointer-events-none flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-white/50 rounded"></div>
                    </div>
                  </div>

                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    وجه الكاميرا نحو رمز QR لقراءة البيانات تلقائياً
                  </p>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={toggleScanner}
                  >
                    إلغاء المسح
                  </Button>
                </div>
              )}
            </div>

            {/* Messages */}
            {message && (
              <div
                className={`p-3 rounded-md text-center ${message.isError
                  ? 'bg-red-50 border border-red-200 text-red-700'
                  : 'bg-green-50 border border-green-200 text-green-700'
                  }`}
              >
                {message.text}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-12 text-lg"
              disabled={isLoading || !orderId || !secretCode}
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جاري المعالجة...
                </>
              ) : (
                'تأكيد التسليم'
              )}
            </Button>

            {/* Helper info */}
            <div className="text-xs text-gray-500 text-center space-y-1">
              <p>• يجب أن يكون رقم الطلب 24 حرفاً (أرقام وحروف انجليزية)</p>
              <p>• الكود السري يجب أن يكون أرقاماً فقط (6-12 رقم)</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}