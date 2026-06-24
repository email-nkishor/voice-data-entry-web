export type SpeechEngine = 'web-speech' | 'gemini' | 'whisper' | 'per-field-mic';

export interface SpeechEngineOption {
  id: SpeechEngine;
  title: string;
  badge: string;
  description: string;
  needsApiKey: boolean;
  apiKeyLabel?: string;
  apiKeyStorageKey?: string;
}

export const SPEECH_ENGINE_OPTIONS: SpeechEngineOption[] = [
  {
    id: 'web-speech',
    title: 'Web Speech API',
    badge: 'Free',
    description: 'Chrome/Edge browser recognition. Local keyword mapping.',
    needsApiKey: false,
  },
  {
    id: 'gemini',
    title: 'Google Gemini API',
    badge: 'Free tier',
    description: 'Better structured field extraction. Needs API key.',
    needsApiKey: true,
    apiKeyLabel: 'Gemini API Key',
    apiKeyStorageKey: 'vde_gemini_api_key',
  },
  {
    id: 'whisper',
    title: 'OpenAI Whisper',
    badge: 'Limited free',
    description: 'Record audio, transcribe via API. Needs API key + backend.',
    needsApiKey: true,
    apiKeyLabel: 'OpenAI API Key',
    apiKeyStorageKey: 'vde_openai_api_key',
  },
  {
    id: 'per-field-mic',
    title: 'Per-field mic',
    badge: 'Free',
    description: 'Most accurate — use the mic on each form field only.',
    needsApiKey: false,
  },
];
