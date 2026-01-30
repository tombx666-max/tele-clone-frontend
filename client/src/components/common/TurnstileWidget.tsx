import { useEffect, useRef } from 'react';

const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

// Note: Console may show "Private Access Token ... 401" and preload warnings. These are from
// Turnstile's internal flow (PAT is optional; 401 means fallback to checkbox). Safe to ignore.

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact';
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: (errorCode?: string) => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

function waitForTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + 10000;
    const t = setInterval(() => {
      if (window.turnstile) {
        clearInterval(t);
        resolve();
      } else if (Date.now() > deadline) {
        clearInterval(t);
        reject(new Error('Turnstile failed to load'));
      }
    }, 50);
  });
}

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  const existing = document.querySelector(`script[src*="challenges.cloudflare.com/turnstile"]`);
  if (existing) return waitForTurnstile();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_URL;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Turnstile script failed to load'));
    document.head.appendChild(script);
  });
}

interface TurnstileWidgetProps {
  sitekey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  resetTrigger?: number; // Increment to reset the widget
}

export function TurnstileWidget({
  sitekey,
  onVerify,
  onExpire,
  theme = 'auto',
  size = 'normal',
  resetTrigger = 0,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  onVerifyRef.current = onVerify;
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!sitekey || !containerRef.current) return;

    let mounted = true;

    loadTurnstileScript()
      .then(() => {
        if (!mounted || !containerRef.current || !window.turnstile) return;
        const id = window.turnstile.render(containerRef.current, {
          sitekey,
          theme,
          size,
          callback: (token) => onVerifyRef.current(token),
          'expired-callback': () => onExpireRef.current?.(),
          'error-callback': () => onExpireRef.current?.(),
        });
        widgetIdRef.current = id;
      })
      .catch(console.error);

    return () => {
      mounted = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (_) {}
        widgetIdRef.current = null;
      }
    };
  }, [sitekey, theme, size]);

  // Reset widget when resetTrigger changes (e.g. after failed submit)
  useEffect(() => {
    if (resetTrigger > 0 && widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch (_) {}
      onExpireRef.current?.();
    }
  }, [resetTrigger]);

  if (!sitekey) return null;

  return <div ref={containerRef} className="flex justify-center [&_.cf-turnstile]:scale-90 [&_.cf-turnstile]:origin-center" />;
}
