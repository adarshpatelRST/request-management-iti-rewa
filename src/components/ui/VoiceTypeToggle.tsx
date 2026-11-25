import React from 'react';
import { Mic } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useVoiceTyping } from '../../context/VoiceTypingContext';

export interface VoiceTypeToggleProps {
  targetInputId?: string;
  size?: 'xs' | 'sm' | 'md';
  variant?: 'light' | 'dark' | 'header';
  className?: string;
  compactOnMobile?: boolean;
}

export const VoiceTypeToggle: React.FC<VoiceTypeToggleProps> = ({
  targetInputId,
  size = 'sm',
  variant = 'light',
  className = '',
  compactOnMobile = true,
}) => {
  const { language } = useLanguage();
  const { isRecording, isSupported, toggleRecording } = useVoiceTyping();

  if (!isSupported) return null;

  const sizeClasses = {
    xs: compactOnMobile
      ? 'p-1.5 sm:px-2 sm:py-1 text-[11px] gap-1'
      : 'px-2 py-1 text-[11px] gap-1',
    sm: compactOnMobile
      ? 'p-1.5 sm:px-2.5 sm:py-1.5 text-xs gap-1 sm:gap-1.5'
      : 'px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs gap-1 sm:gap-1.5',
    md: compactOnMobile
      ? 'p-2 sm:px-3 sm:py-2 text-xs sm:text-sm gap-1.5'
      : 'px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm gap-1.5',
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  };

  const variantIdleClasses = {
    light:
      'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200',
    dark:
      'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600',
    header:
      'bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-[#1e3a8a] border border-slate-200 hover:border-indigo-200',
  };

  const idleClass = variantIdleClasses[variant] || variantIdleClasses.light;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleRecording(targetInputId);
      }}
      className={`inline-flex items-center justify-center rounded-lg font-bold transition-all cursor-pointer select-none shrink-0 ${
        sizeClasses[size]
      } ${
        isRecording
          ? 'bg-rose-600 text-white border border-rose-700 shadow-sm shadow-rose-400/40 animate-pulse ring-2 ring-rose-400'
          : idleClass
      } ${className}`}
      title={
        isRecording
          ? language === 'hi'
            ? 'रिकॉर्डिंग चालू है... रोकने हेतु क्लिक करें'
            : 'Voice typing active... Click to stop'
          : language === 'hi'
          ? 'बोलकर लिखें (Voice Typing)'
          : 'Voice Typing (Click to dictate)'
      }
      aria-label="Toggle voice typing speech recognition"
    >
      {isRecording ? (
        <>
          <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
          {compactOnMobile ? (
            <>
              <span className="font-semibold hidden sm:inline">
                {language === 'hi' ? 'रिकॉर्डिंग चालू' : 'Listening...'}
              </span>
              <span className="font-semibold text-[10px] sm:hidden leading-none">
                {language === 'hi' ? 'चालू' : 'REC'}
              </span>
            </>
          ) : (
            <span className="font-semibold">
              {language === 'hi' ? 'रिकॉर्डिंग चालू' : 'Listening...'}
            </span>
          )}
        </>
      ) : (
        <>
          <Mic
            className={`${iconSizes[size]} ${
              variant === 'dark' ? 'text-slate-300' : 'text-slate-600'
            } shrink-0`}
          />
          {compactOnMobile ? (
            <span className="font-semibold hidden sm:inline">
              {language === 'hi' ? 'बोलकर लिखें' : 'Voice Type'}
            </span>
          ) : (
            <span className="font-semibold">
              {language === 'hi' ? 'बोलकर लिखें' : 'Voice Type'}
            </span>
          )}
        </>
      )}
    </button>
  );
};
