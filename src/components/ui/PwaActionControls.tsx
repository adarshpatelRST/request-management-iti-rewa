import React from 'react';
import { Download, WifiOff } from 'lucide-react';
import { usePwa } from '../../context/PwaContext';
import { useLanguage } from '../../i18n/LanguageContext';

/**
 * Displays a subtle offline indicator when disconnected and an Install App
 * action button whenever the browser exposes a PWA install prompt.
 */
export const PwaActionControls: React.FC = () => {
  const { canInstall, isOnline, promptInstall } = usePwa();
  const { language } = useLanguage();

  if (isOnline && !canInstall) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5">
      {!isOnline && (
        <span
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200"
          title={language === 'hi' ? 'ऑफ़लाइन मोड सक्रिय' : 'Offline mode active'}
        >
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">
            {language === 'hi' ? 'ऑफ़लाइन' : 'Offline'}
          </span>
        </span>
      )}

      {canInstall && (
        <button
          type="button"
          onClick={promptInstall}
          className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#1e3a8a] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer shadow-2xs"
          title={
            language === 'hi'
              ? 'ऐप को अपने डिवाइस पर इंस्टॉल करें'
              : 'Install app on your device'
          }
          aria-label={language === 'hi' ? 'ऐप इंस्टॉल करें' : 'Install App'}
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">
            {language === 'hi' ? 'ऐप इंस्टॉल करें' : 'Install App'}
          </span>
          <span className="sm:hidden">
            {language === 'hi' ? 'इंस्टॉल' : 'Install'}
          </span>
        </button>
      )}
    </div>
  );
};
