// Dynamic loader for Paymob Unified Checkout script
// Ensures the script is only loaded once and resolves when Paymob SDK is available.
export const loadPaymobCheckoutScript = (): Promise<void> => {
  const existing = document.querySelector<HTMLScriptElement>(
    'script[src="https://accept.paymob.com/api/acceptance/checkout.js"]'
  );

  if (existing && (window as any).Paymob) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accept.paymob.com/api/acceptance/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paymob script'));
    document.body.appendChild(script);
  });
};
