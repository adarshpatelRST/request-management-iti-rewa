import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'sonner';
import { useLanguage } from '../i18n/LanguageContext';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PwaContextValue {
  canInstall: boolean;
  isOnline: boolean;
  promptInstall: () => Promise<void>;
}

const PwaContext = createContext<PwaContextValue | null>(null);

/**
 * Manages PWA service worker registration, offline-ready notifications,
 * online/offline network status, and deferred app install prompts.
 */
export const PwaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const {
    offlineReady: [offlineReady, setOfflineReady],
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) {
        return;
      }
      // Periodically check for updated service workers while the tab remains open.
      window.setInterval(() => {
        registration.update().catch(() => {});
      }, 60 * 60 * 1000);
    },
  });

  useEffect(() => {
    if (!offlineReady) {
      return;
    }
    toast.success(
      language === 'hi'
        ? 'ऐप ऑफ़लाइन उपयोग के लिए तैयार है।'
        : 'App is cached and ready to work offline.'
    );
    setOfflineReady(false);
  }, [offlineReady, setOfflineReady, language]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      toast.success(
        language === 'hi'
          ? 'आई.टी.आई. रीवा स्टोर ऐप सफलतापूर्वक इंस्टॉल हो गया।'
          : 'Govt. ITI Rewa app installed successfully.'
      );
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [language]);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      return;
    }
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  return (
    <PwaContext.Provider
      value={{
        canInstall: deferredPrompt !== null,
        isOnline,
        promptInstall,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
};

export function usePwa(): PwaContextValue {
  const ctx = useContext(PwaContext);
  if (!ctx) {
    throw new Error('usePwa must be used within a PwaProvider');
  }
  return ctx;
}
