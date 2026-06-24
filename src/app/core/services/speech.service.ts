import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SpeechRecognitionResult } from '../models/speech-result.model';

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultItem {
  isFinal: boolean;
  length: number;
  [index: number]: { transcript: string };
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

@Injectable({
  providedIn: 'root',
})
export class SpeechService {
  private recognition: SpeechRecognitionInstance | null = null;
  private readonly resultSubject = new Subject<SpeechRecognitionResult>();
  private listening = false;
  private activeLocale = 'en-IN';

  constructor(private ngZone: NgZone) {}

  isSupported(): boolean {
    return !!(
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)
    );
  }

  startListening(locale = 'en-IN'): Observable<SpeechRecognitionResult> {
    if (!this.isSupported()) {
      throw new Error('Speech recognition is not supported in this browser.');
    }

    if (this.listening) {
      return this.resultSubject.asObservable();
    }

    this.activeLocale = locale;
    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition!;
    this.recognition = new SpeechRecognitionCtor();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = locale;
    this.listening = true;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let fullTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i] as SpeechRecognitionResultItem;
        fullTranscript += result[0].transcript;
      }

      const lastResult = event.results[
        event.results.length - 1
      ] as SpeechRecognitionResultItem;
      const isFinal = lastResult.isFinal;

      this.ngZone.run(() => {
        this.resultSubject.next({
          text: fullTranscript.trim(),
          isFinal,
        });
      });
    };

    this.recognition.onerror = () => {
      this.ngZone.run(() => {
        this.listening = false;
      });
    };

    this.recognition.onend = () => {
      this.ngZone.run(() => {
        if (this.listening && this.recognition) {
          try {
            this.recognition.lang = this.activeLocale;
            this.recognition.start();
          } catch {
            this.listening = false;
          }
          return;
        }
        this.listening = false;
      });
    };

    this.recognition.start();
    return this.resultSubject.asObservable();
  }

  stopListening(): void {
    if (!this.listening || !this.recognition) {
      return;
    }

    this.listening = false;
    this.recognition.stop();
  }
}
