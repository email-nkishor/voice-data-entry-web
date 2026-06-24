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
import { SpeechService } from '../../../core/services/speech.service';
import { VoiceCommandService } from '../../../core/services/voice-command.service';
import { VoiceParserService } from '../../../core/services/voice-parser.service';

const LANGUAGE_STORAGE_KEY = 'voice-entry-language';

@Component({
  selector: 'app-voice-input-panel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './voice-input-panel.component.html',
  styleUrl: './voice-input-panel.component.scss',
})
export class VoiceInputPanelComponent implements OnInit, OnDestroy {
  @Input() columns: DynamicColumn[] = [];
  @Output() valuesParsed = new EventEmitter<Record<string, string>>();
  @Output() resetRequested = new EventEmitter<void>();
  @Output() listeningStarted = new EventEmitter<void>();

  languages = SPEECH_LANGUAGES;
  selectedLanguage = DEFAULT_SPEECH_LANGUAGE;
  hintText = SPEECH_LANGUAGES[0].hint;

  transcript = '';
  parsedPreview: Record<string, string> = {};
  isListening = false;
  speechSupported = false;
  parseWarning = '';

  private speechSubscription?: Subscription;

  constructor(
    private speechService: SpeechService,
    private voiceParserService: VoiceParserService,
    private voiceCommandService: VoiceCommandService
  ) {
    this.speechSupported = this.speechService.isSupported();
  }

  ngOnInit(): void {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved) {
      this.onLanguageChange(saved);
    }
  }

  onLanguageChange(code: string): void {
    this.selectedLanguage = code;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    const language = this.languages.find((item) => item.code === code);
    this.hintText = language?.hint ?? this.languages[0].hint;
  }

  onToggleListening(): void {
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

        if (this.voiceCommandService.isResetCommand(this.transcript)) {
          this.handleResetCommand();
          return;
        }

        if (result.isFinal) {
          this.updatePreview();
          this.applyTranscript();
        }
      });
  }

  onApplyTranscript(): void {
    if (this.voiceCommandService.isResetCommand(this.transcript)) {
      this.handleResetCommand();
      return;
    }

    this.updatePreview();
    this.applyTranscript();
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
  }

  get listening(): boolean {
    return this.isListening;
  }

  getPreviewEntries(): Array<{ key: string; value: string }> {
    return Object.entries(this.parsedPreview).map(([key, value]) => ({
      key,
      value,
    }));
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
  }

  private resetPanelState(): void {
    this.transcript = '';
    this.parsedPreview = {};
    this.parseWarning = '';
  }

  private updatePreview(): void {
    if (!this.transcript.trim() || this.columns.length === 0) {
      this.parsedPreview = {};
      this.parseWarning = '';
      return;
    }

    if (this.voiceCommandService.isResetCommand(this.transcript)) {
      return;
    }

    this.parsedPreview = this.voiceParserService.parse(
      this.transcript,
      this.columns
    );

    const matchedFields = Object.keys(this.parsedPreview).length;
    const hasKeywords = this.columns.some((column) => !column.isLeadingField);

    if (hasKeywords && matchedFields <= 1 && this.transcript.length > 20) {
      this.parseWarning =
        'Only one field detected. Speak field keywords clearly (name, class, roll number, mobile, address).';
    } else {
      this.parseWarning = '';
    }
  }

  private applyTranscript(): void {
    if (!this.transcript.trim() || this.columns.length === 0) {
      return;
    }

    if (this.voiceCommandService.isResetCommand(this.transcript)) {
      return;
    }

    const parsed = this.voiceParserService.parse(this.transcript, this.columns);
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

    this.updatePreview();
    this.applyTranscript();
  }

  ngOnDestroy(): void {
    this.speechSubscription?.unsubscribe();
    if (this.isListening) {
      this.speechService.stopListening();
    }
  }
}
