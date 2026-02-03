declare module 'react-qr-scanner' {
  import * as React from 'react';
  interface QrScannerProps {
    delay?: number;
    constraints?: any;
    onError?: (error: any) => void;
    onScan?: (result: any) => void;
    style?: React.CSSProperties;
    [key: string]: any;
  }
  const QrScanner: React.FC<QrScannerProps>;
  export default QrScanner;
}
