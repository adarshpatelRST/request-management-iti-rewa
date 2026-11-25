import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { toast } from 'sonner';
import { useLanguage } from '../i18n/LanguageContext';

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal?: boolean;
      [index: number]: { transcript: string };
    };
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
}

interface VoiceTypingContextType {
  isRecording: boolean;
  isSupported: boolean;
  liveTranscript: string;
  toggleRecording: (target?: string | HTMLInputElement | HTMLTextAreaElement) => void;
  stopRecording: () => void;
}

const VoiceTypingContext = createContext<VoiceTypingContextType | undefined>(
  undefined
);

// Helper to safely dispatch native value updates to any React controlled input or textarea
function setNativeInputValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  valueToInsert: string
) {
  const currentValue = element.value || '';
  const newValue = currentValue.trim()
    ? `${currentValue.trim()} ${valueToInsert}`
    : valueToInsert;

  const maxLen = element.maxLength > 0 ? element.maxLength : undefined;
  const clampedValue =
    maxLen && newValue.length > maxLen ? newValue.slice(0, maxLen) : newValue;

  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(
    prototype,
    'value'
  )?.set;
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;

  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, clampedValue);
  } else if (valueSetter) {
    valueSetter.call(element, clampedValue);
  } else {
    element.value = clampedValue;
  }

  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

export const VoiceTypingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { language } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const shouldBeRecordingRef = useRef(false);
  const activeInputElementRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(
    null
  );

  // Track focused text inputs and textareas across the entire application
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        // Exclude passwords and buttons
        if (target.type !== 'password' && target.type !== 'button') {
          activeInputElementRef.current = target;
        }
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, []);

  // Detect Web Speech API support
  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    setIsSupported(supported);
  }, []);

  const stopRecording = useCallback(() => {
    shouldBeRecordingRef.current = false;
    setIsRecording(false);
    setLiveTranscript('');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // already stopped
      }
      recognitionRef.current = null;
    }
  }, []);

  // Unmount cleanup
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  const startRecording = useCallback(() => {
    try {
      const windowObj = window as unknown as {
        SpeechRecognition?: new () => SpeechRecognitionInstance;
        webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
      };
      const SpeechRecognitionCtor =
        windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

      if (!SpeechRecognitionCtor) {
        toast.error(
          language === 'hi'
            ? 'आपके ब्राउज़र में आवाज़ पहचान (Web Speech API) समर्थित नहीं है।'
            : 'Speech recognition is not supported in this browser.'
        );
        return;
      }

      const recognition = new SpeechRecognitionCtor();
      // ROOT CAUSE FIX: continuous = true keeps the session alive without auto-stopping after 1 second!
      recognition.continuous = true;
      recognition.interimResults = true;
      // Language code: hi-IN for Hindi mode, en-IN for Indian English
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsRecording(true);
        shouldBeRecordingRef.current = true;
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const text = res?.[0]?.transcript || '';
          if (res?.isFinal) {
            const finalText = text.trim();
            if (finalText) {
              if (activeInputElementRef.current) {
                setNativeInputValue(activeInputElementRef.current, finalText);
              }
            }
          } else {
            interim += text;
          }
        }
        setLiveTranscript(interim);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        // Silence pauses should not stop the recording session
        if (event.error === 'no-speech') {
          return;
        }

        if (event.error === 'not-allowed') {
          shouldBeRecordingRef.current = false;
          setIsRecording(false);
          toast.error(
            language === 'hi'
              ? 'माइक्रोफ़ोन की अनुमति नहीं दी गई। कृपया ब्राउज़र URL बार में माइक आइकॉन पर क्लिक कर अनुमति Allow करें।'
              : 'Microphone permission denied. Please allow microphone access in your browser settings.'
          );
        } else if (event.error === 'network') {
          shouldBeRecordingRef.current = false;
          setIsRecording(false);
          toast.error(
            language === 'hi'
              ? 'भाषण पहचान नेटवर्क त्रुटि। (यदि आप Brave ब्राउज़र में हैं, तो Brave Settings में "Google Services for speech" सक्षम करें अथवा Chrome/Edge उपयोग करें)।'
              : 'Speech recognition network error. In Brave browser, please enable "Google services for speech recognition" in settings or use Chrome/Edge.'
          );
        }
      };

      recognition.onend = () => {
        // ROOT CAUSE FIX: In Chromium, onend can prematurely fire after silence.
        // If the user hasn't explicitly clicked stop, auto-restart the stream!
        if (shouldBeRecordingRef.current) {
          try {
            recognition.start();
          } catch {
            // Already started or restarting
          }
        } else {
          setIsRecording(false);
          recognitionRef.current = null;
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

      toast.info(
        language === 'hi'
          ? '🎙️ आवाज़ पहचान प्रारंभ! किसी भी इनपुट बॉक्स पर क्लिक करें और बोलें।'
          : '🎙️ Voice typing active! Click any input box and speak.'
      );
    } catch {
      setIsRecording(false);
      shouldBeRecordingRef.current = false;
      toast.error(
        language === 'hi'
          ? 'माइक्रोफ़ोन प्रारंभ करने में त्रुटि।'
          : 'Could not initialize speech recognition.'
      );
    }
  }, [language]);

  const toggleRecording = useCallback(
    (target?: string | HTMLInputElement | HTMLTextAreaElement) => {
      if (isRecording) {
        stopRecording();
        toast.success(
          language === 'hi'
            ? 'आवाज़ पहचान समाप्त। पाठ सफलतापूर्वक दर्ज किया गया।'
            : 'Voice typing stopped. Text recorded.'
        );
      } else {
        if (typeof target === 'string') {
          const el = document.getElementById(target);
          if (
            el instanceof HTMLInputElement ||
            el instanceof HTMLTextAreaElement
          ) {
            activeInputElementRef.current = el;
            el.focus();
          }
        } else if (target) {
          activeInputElementRef.current = target;
          target.focus();
        }
        startRecording();
      }
    },
    [isRecording, stopRecording, startRecording, language]
  );

  return (
    <VoiceTypingContext.Provider
      value={{
        isRecording,
        isSupported,
        liveTranscript,
        toggleRecording,
        stopRecording,
      }}
    >
      {children}
    </VoiceTypingContext.Provider>
  );
};

export const useVoiceTyping = (): VoiceTypingContextType => {
  const context = useContext(VoiceTypingContext);
  if (!context) {
    throw new Error('useVoiceTyping must be used within a VoiceTypingProvider');
  }
  return context;
};
