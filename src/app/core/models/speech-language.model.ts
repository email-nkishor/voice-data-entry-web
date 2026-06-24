export interface SpeechLanguage {
  code: string;
  label: string;
  hint: string;
}

export const SPEECH_LANGUAGES: SpeechLanguage[] = [
  {
    code: 'en-IN',
    label: 'English (India)',
    hint: 'Rahul Kumar Class 10 Roll Number 101 Mobile 9876543210',
  },
  {
    code: 'en-US',
    label: 'English (US)',
    hint: 'Rahul Kumar Class 10 Roll Number 101 Mobile 9876543210',
  },
  {
    code: 'hi-IN',
    label: 'Hindi (India)',
    hint: 'राहुल कुमार क्लास 10 रोल नंबर 101 मोबाइल 9876543210',
  },
  {
    code: 'mr-IN',
    label: 'Marathi (India)',
    hint: 'राहुल कुमार इयत्ता 10 रोल नंबर 101 मोबाइल 9876543210',
  },
  {
    code: 'ta-IN',
    label: 'Tamil (India)',
    hint: 'ராகுல் குமார் Class 10 Roll Number 101 Mobile 9876543210',
  },
];

export const DEFAULT_SPEECH_LANGUAGE = 'en-IN';
