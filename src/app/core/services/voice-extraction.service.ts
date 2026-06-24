import { Injectable } from '@angular/core';
import { DynamicColumn } from '../models/dynamic-column.model';
import { SpeechEngine } from '../models/speech-engine.model';
import { ApiService } from './api.service';
import { SpeechSettingsService } from './speech-settings.service';
import { VoiceParserService } from './voice-parser.service';

@Injectable({ providedIn: 'root' })
export class VoiceExtractionService {
  constructor(
    private voiceParserService: VoiceParserService,
    private speechSettings: SpeechSettingsService,
    private apiService: ApiService
  ) {}

  async extractFields(
    transcript: string,
    columns: DynamicColumn[],
    engine: SpeechEngine = this.speechSettings.engine
  ): Promise<Record<string, string>> {
    const text = transcript.trim();
    if (!text || columns.length === 0) {
      return {};
    }

    if (engine === 'gemini') {
      return this.extractWithGemini(text, columns);
    }

    return this.voiceParserService.parse(text, columns);
  }

  async transcribeWhisper(audioBlob: Blob): Promise<string> {
    const option = this.speechSettings.options.find((o) => o.id === 'whisper')!;
    const apiKey = this.speechSettings.getApiKey(option);
    if (!apiKey) {
      throw new Error('OpenAI API key is required for Whisper.');
    }

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('apiKey', apiKey);

    const response = await this.apiService.postForm<{ transcript: string }>(
      '/speech/whisper',
      formData
    );
    return response.transcript?.trim() ?? '';
  }

  private async extractWithGemini(
    transcript: string,
    columns: DynamicColumn[]
  ): Promise<Record<string, string>> {
    const option = this.speechSettings.options.find((o) => o.id === 'gemini')!;
    const apiKey = this.speechSettings.getApiKey(option);
    if (!apiKey) {
      throw new Error('Gemini API key is required.');
    }

    try {
      const response = await this.apiService.post<{ fields: Record<string, string> }>(
        '/speech/gemini-extract',
        {
          transcript,
          apiKey,
          columns: columns.map((c) => ({
            key: c.columnKey,
            label: c.label,
          })),
        }
      );
      if (response.fields && Object.keys(response.fields).length > 0) {
        return response.fields;
      }
    } catch {
      // Fall back to local parser if API fails
    }

    return this.voiceParserService.parse(transcript, columns);
  }
}
