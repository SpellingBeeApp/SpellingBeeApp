"use client";

import React from "react";

type UseWordPronunciationOptions = {
  rate?: number;
  pitch?: number;
};

const pickEnglishVoice = (): SpeechSynthesisVoice | undefined => {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((voice) => voice.lang === "en-US" && !voice.localService) ??
    voices.find((voice) => voice.lang.startsWith("en-US")) ??
    voices.find((voice) => voice.lang.startsWith("en"))
  );
};

export default function useWordPronunciation(
  options: UseWordPronunciationOptions = {},
) {
  const { rate = 0.85, pitch = 1 } = options;
  const [isSupported, setIsSupported] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [voicesReady, setVoicesReady] = React.useState(false);
  const voiceRef = React.useRef<SpeechSynthesisVoice | undefined>(undefined);

  React.useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    setIsSupported(true);

    const loadVoices = () => {
      voiceRef.current = pickEnglishVoice();
      setVoicesReady(window.speechSynthesis.getVoices().length > 0);
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = React.useCallback(
    (text: string, { announce = false }: { announce?: boolean } = {}) => {
      if (!isSupported || !text.trim()) return;

      window.speechSynthesis.cancel();

      const phrase = announce ? `Your word is ${text}` : text;
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = "en-US";
      utterance.rate = rate;
      utterance.pitch = pitch;

      if (voiceRef.current) {
        utterance.voice = voiceRef.current;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, pitch, rate],
  );

  const stop = React.useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    isSupported,
    isSpeaking,
    voicesReady,
    speak,
    stop,
  };
}
