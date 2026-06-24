import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  SPEECH_ENGINE_OPTIONS,
  SpeechEngine,
  SpeechEngineOption,
} from '../models/speech-engine.model';

const ENGINE_STORAGE_KEY = 'vde_speech_engine';

@Injectable({ providedIn: 'root' })
export class SpeechSettingsService {
  private readonly engineSubject = new BehaviorSubject<SpeechEngine>(this.loadEngine());
  readonly engine$ = this.engineSubject.asObservable();

  get engine(): SpeechEngine {
    return this.engineSubject.value;
  }

  get options(): SpeechEngineOption[] {
    return SPEECH_ENGINE_OPTIONS;
  }

  get selectedOption(): SpeechEngineOption {
    return SPEECH_ENGINE_OPTIONS.find((o) => o.id === this.engine) ?? SPEECH_ENGINE_OPTIONS[0];
  }

  setEngine(engine: SpeechEngine): void {
    localStorage.setItem(ENGINE_STORAGE_KEY, engine);
    this.engineSubject.next(engine);
  }

  isPerFieldMode(): boolean {
    return this.engine === 'per-field-mic';
  }

  getApiKey(option: SpeechEngineOption): string {
    if (!option.apiKeyStorageKey) {
      return '';
    }
    return localStorage.getItem(option.apiKeyStorageKey) ?? '';
  }

  setApiKey(option: SpeechEngineOption, key: string): void {
    if (!option.apiKeyStorageKey) {
      return;
    }
    localStorage.setItem(option.apiKeyStorageKey, key.trim());
  }

  private loadEngine(): SpeechEngine {
    const saved = localStorage.getItem(ENGINE_STORAGE_KEY) as SpeechEngine | null;
    if (saved && SPEECH_ENGINE_OPTIONS.some((o) => o.id === saved)) {
      return saved;
    }
    return 'web-speech';
  }
}
