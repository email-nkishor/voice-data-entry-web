import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DynamicColumn } from '../../../core/models/dynamic-column.model';
import {
  DEFAULT_SPEECH_LANGUAGE,
  SPEECH_LANGUAGES,
} from '../../../core/models/speech-language.model';
import { SpeechSettingsService } from '../../../core/services/speech-settings.service';
import { SpeechService } from '../../../core/services/speech.service';
import { VoiceCommandService } from '../../../core/services/voice-command.service';
import { VoiceExtractionService } from '../../../core/services/voice-extraction.service';
import { VoiceSessionService } from '../../../core/services/voice-session.service';
import { SpeechEngineSelectorComponent } from '../speech-engine-selector/speech-engine-selector.component';

const LANGUAGE_STORAGE_KEY = 'voice-entry-language';

@Component({
  selector: 'app-voice-input-panel',
  standalone: true,
  imports: [FormsModule, SpeechEngineSelectorComponent],
  templateUrl: './voice-input-panel.component.html',
  styleUrl: './voice-input-panel.component.scss',
})
export class VoiceInputPanelComponent implements OnInit, OnDestroy {
  @Input() columns: DynamicColumn[] = [];
  @Input() moduleCode = 'student';
  @Input() showEngineSelector = true;
  @Output() valuesParsed = new EventEmitter<Record<string, string>>();
  @Output() resetRequested = new EventEmitter<void>();
  @Output() listeningStarted = new EventEmitter<void>();

  languages = SPEECH_LANGUAGES;
  selectedLanguage = DEFAULT_SPEECH_LANGUAGE;
  hintText = SPEECH_LANGUAGES[0].hint;

  transcript = '';
  parsedPreview: Record<string, string> = {};
  isListening = false;
  isRecording = false;
  isProcessing = false;
  speechSupported = false;
  parseWarning = '';
  statusMessage = '';

  private speechSubscription?: Subscription;
  private mediaRecorder?: MediaRecorder;
  private audioChunks: Blob[] = [];

  constructor(
    private speechService: SpeechService,
    private voiceCommandService: VoiceCommandService,
    private voiceExtractionService: VoiceExtractionService,
    private voiceSessionService: VoiceSessionService,
    public speechSettings: SpeechSettingsService
  ) {
    this.speechSupported = this.speechService.isSupported();
  }

  get perFieldMode(): boolean {
    return this.speechSettings.isPerFieldMode();
  }

  get whisperMode(): boolean {
    return this.speechSettings.engine === 'whisper';
  }

  get geminiMode(): boolean {
    return this.speechSettings.engine === 'gemini';
  }

  ngOnInit(): void {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved) {
      this.onLanguageChange(saved);
    }
    this.voiceSessionService.begin(this.moduleCode);
    this.voiceSessionService.setSpeechEngine(this.speechSettings.engine);
  }

  onLanguageChange(code: string): void {
    this.selectedLanguage = code;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    const language = this.languages.find((item) => item.code === code);
    this.hintText = language?.hint ?? this.languages[0].hint;
  }

  async onToggleListening(): Promise<void> {
    if (this.whisperMode) {
      await this.toggleWhisperRecording();
      return;
    }

    if (this.isListening) {
      this.stopListening();
      return;
    }

    this.resetPanelState();
    this.isListening = true;
    this.listeningStarted.emit();

    this.speechSubscription = this.speechService
      .startListening(this.selectedLanguage)
      .subscribe((result) => {
        this.transcript = result.text;
        this.syncSession();

        if (this.voiceCommandService.isResetCommand(this.transcript)) {
          this.handleResetCommand();
          return;
        }

        if (result.isFinal) {
          void this.updatePreview();
          void this.applyTranscript();
        }
      });
  }

  async onApplyTranscript(): Promise<void> {
    if (this.voiceCommandService.isResetCommand(this.transcript)) {
      this.handleResetCommand();
      return;
    }

    await this.updatePreview();
    await this.applyTranscript();
  }

  onReset(): void {
    this.handleResetCommand();
  }

  resetPanel(): void {
    this.resetPanelState();
  }

  stopListeningIfActive(): void {
    if (this.isListening) {
      this.stopListening();
    }
    if (this.isRecording) {
      void this.stopWhisperRecording();
    }
  }

  getPreviewEntries(): Array<{ key: string; value: string }> {
    return Object.entries(this.parsedPreview).map(([key, value]) => ({
      key,
      value,
    }));
  }

  private async toggleWhisperRecording(): Promise<void> {
    if (this.isRecording) {
      await this.stopWhisperRecording();
      return;
    }

    this.resetPanelState();
    this.listeningStarted.emit();
    this.audioChunks = [];

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };
    this.mediaRecorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      void this.processWhisperAudio();
    };

    this.isRecording = true;
    this.statusMessage = 'Recording… speak all fields, then tap Stop.';
    this.mediaRecorder.start();
  }

  private async stopWhisperRecording(): Promise<void> {
    if (!this.mediaRecorder || !this.isRecording) {
      return;
    }
    this.isRecording = false;
    this.mediaRecorder.stop();
  }

  private async processWhisperAudio(): Promise<void> {
    this.isProcessing = true;
    this.statusMessage = 'Transcribing with Whisper…';
    try {
      const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
      this.transcript = await this.voiceExtractionService.transcribeWhisper(blob);
      await this.updatePreview();
      this.syncSession();
      await this.applyTranscript();
      this.statusMessage = '';
    } catch (err) {
      this.parseWarning = err instanceof Error ? err.message : 'Whisper failed';
      this.statusMessage = '';
    } finally {
      this.isProcessing = false;
    }
  }

  private handleResetCommand(): void {
    this.resetPanelState();
    this.resetRequested.emit();
    if (this.isListening) {
      this.speechSubscription?.unsubscribe();
      this.speechSubscription = undefined;
      this.speechService.stopListening();
      this.isListening = false;
    }
    if (this.isRecording) {
      void this.stopWhisperRecording();
    }
  }

  private resetPanelState(): void {
    this.transcript = '';
    this.parsedPreview = {};
    this.parseWarning = '';
    this.statusMessage = '';
    this.voiceSessionService.clear();
  }

  private syncSession(): void {
    this.voiceSessionService.setSpeechEngine(this.speechSettings.engine);
    this.voiceSessionService.updateTranscript(this.transcript);
    if (Object.keys(this.parsedPreview).length > 0) {
      this.voiceSessionService.updateProcessedJson(this.parsedPreview);
    }
  }

  private async updatePreview(): Promise<void> {
    if (!this.transcript.trim() || this.columns.length === 0) {
      this.parsedPreview = {};
      this.parseWarning = '';
      return;
    }

    if (this.voiceCommandService.isResetCommand(this.transcript)) {
      return;
    }

    try {
      this.isProcessing = true;
      this.parsedPreview = await this.voiceExtractionService.extractFields(
        this.transcript,
        this.columns
      );
      this.syncSession();
      const matchedFields = Object.keys(this.parsedPreview).length;
      if (matchedFields <= 1 && this.transcript.length > 20 && !this.geminiMode) {
        this.parseWarning =
          'Only one field detected. Pause between fields or try Gemini API mode.';
      } else {
        this.parseWarning = '';
      }
    } catch (err) {
      this.parseWarning = err instanceof Error ? err.message : 'Could not parse speech';
    } finally {
      this.isProcessing = false;
    }
  }

  private async applyTranscript(): Promise<void> {
    if (!this.transcript.trim() || this.columns.length === 0) {
      return;
    }

    if (this.voiceCommandService.isResetCommand(this.transcript)) {
      return;
    }

    const parsed = await this.voiceExtractionService.extractFields(
      this.transcript,
      this.columns
    );
    if (Object.keys(parsed).length > 0) {
      this.valuesParsed.emit(parsed);
    }
  }

  private stopListening(): void {
    this.speechSubscription?.unsubscribe();
    this.speechSubscription = undefined;
    this.speechService.stopListening();
    this.isListening = false;

    if (this.voiceCommandService.isResetCommand(this.transcript)) {
      this.handleResetCommand();
      return;
    }

    void this.updatePreview();
    void this.applyTranscript();
  }

  ngOnDestroy(): void {
    this.speechSubscription?.unsubscribe();
    if (this.isListening) {
      this.speechService.stopListening();
    }
    if (this.isRecording) {
      void this.stopWhisperRecording();
    }
  }
}
