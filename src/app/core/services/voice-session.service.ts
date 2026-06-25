import { Injectable } from '@angular/core';
import { SpeechEngine } from '../models/speech-engine.model';

export interface VoiceSessionSnapshot {
  moduleCode: string;
  transcript: string;
  processedJson: Record<string, unknown> | null;
  speechEngine: SpeechEngine | null;
}

@Injectable({ providedIn: 'root' })
export class VoiceSessionService {
  private moduleCode = '';
  private transcript = '';
  private processedJson: Record<string, unknown> | null = null;
  private speechEngine: SpeechEngine | null = null;

  begin(moduleCode: string): void {
    this.moduleCode = moduleCode;
    this.transcript = '';
    this.processedJson = null;
    this.speechEngine = null;
  }

  updateTranscript(transcript: string): void {
    this.transcript = transcript;
  }

  updateProcessedJson(processed: Record<string, string> | Record<string, unknown>): void {
    this.processedJson = { ...processed };
  }

  setSpeechEngine(engine: SpeechEngine): void {
    this.speechEngine = engine;
  }

  getSnapshot(): VoiceSessionSnapshot | null {
    if (!this.moduleCode || !this.hasContent()) {
      return null;
    }
    return {
      moduleCode: this.moduleCode,
      transcript: this.transcript,
      processedJson: this.processedJson,
      speechEngine: this.speechEngine,
    };
  }

  hasContent(): boolean {
    return this.transcript.trim().length > 0;
  }

  clear(): void {
    this.transcript = '';
    this.processedJson = null;
  }

  reset(): void {
    this.moduleCode = '';
    this.transcript = '';
    this.processedJson = null;
    this.speechEngine = null;
  }
}
