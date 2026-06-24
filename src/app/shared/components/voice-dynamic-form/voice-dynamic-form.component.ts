import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { DynamicColumn } from '../../../core/models/dynamic-column.model';
import { DEFAULT_SPEECH_LANGUAGE } from '../../../core/models/speech-language.model';
import { SpeechService } from '../../../core/services/speech.service';
import { VoiceParserService } from '../../../core/services/voice-parser.service';
import {
  applyVoiceParsedValues,
  getColumnInputType,
  isMultilineColumn,
} from '../../../core/utils/voice-form.util';
import { VoiceInputPanelComponent } from '../voice-input-panel/voice-input-panel.component';

const LANGUAGE_STORAGE_KEY = 'voice-entry-language';

@Component({
  selector: 'app-voice-dynamic-form',
  standalone: true,
  imports: [FormsModule, RouterLink, VoiceInputPanelComponent],
  templateUrl: './voice-dynamic-form.component.html',
  styleUrl: './voice-dynamic-form.component.scss',
})
export class VoiceDynamicFormComponent implements OnDestroy {
  @Input() columns: DynamicColumn[] = [];
  @Input() formValues: Record<string, string> = {};
  @Input() validationErrors: Record<string, string> = {};
  @Input() submitLabel = 'Save';
  @Input() configureColumnsLink: string | null = null;
  @Input() hideFormActions = false;

  @Output() save = new EventEmitter<void>();
  @Output() resetForm = new EventEmitter<void>();

  @ViewChild(VoiceInputPanelComponent)
  voicePanel?: VoiceInputPanelComponent;

  listeningFieldKey: string | null = null;
  fieldTranscript = '';
  speechSupported = false;

  private fieldSpeechSubscription?: Subscription;
  private selectedLanguage = DEFAULT_SPEECH_LANGUAGE;

  constructor(
    private speechService: SpeechService,
    private voiceParserService: VoiceParserService
  ) {
    this.speechSupported = this.speechService.isSupported();
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved) {
      this.selectedLanguage = saved;
    }
  }

  onVoiceParsed(parsed: Record<string, string>): void {
    this.stopFieldMic();
    applyVoiceParsedValues(this.formValues, parsed);
  }

  onReset(): void {
    this.stopFieldMic();
    this.voicePanel?.resetPanel();
    this.resetForm.emit();
  }

  onSubmit(): void {
    this.save.emit();
  }

  onGlobalListeningStart(): void {
    this.stopFieldMic();
  }

  toggleFieldMic(column: DynamicColumn): void {
    if (!this.speechSupported) {
      return;
    }

    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage) {
      this.selectedLanguage = savedLanguage;
    }

    if (this.listeningFieldKey === column.columnKey) {
      this.stopFieldMic(true);
      return;
    }

    this.stopFieldMic();
    this.voicePanel?.stopListeningIfActive();

    this.listeningFieldKey = column.columnKey;
    this.fieldTranscript = '';

    this.fieldSpeechSubscription = this.speechService
      .startListening(this.selectedLanguage)
      .subscribe((result) => {
        if (this.listeningFieldKey !== column.columnKey) {
          return;
        }

        this.fieldTranscript = result.text;

        if (result.isFinal) {
          this.applyFieldTranscript(column);
        }
      });
  }

  isFieldListening(columnKey: string): boolean {
    return this.listeningFieldKey === columnKey;
  }

  isMultiline(column: DynamicColumn): boolean {
    return isMultilineColumn(column);
  }

  getInputType(column: DynamicColumn): string {
    return getColumnInputType(column);
  }

  getFieldError(columnKey: string): string {
    return this.validationErrors[columnKey] ?? '';
  }

  ngOnDestroy(): void {
    this.stopFieldMic();
  }

  private applyFieldTranscript(column: DynamicColumn): void {
    const value = this.voiceParserService.parseFieldValue(
      this.fieldTranscript,
      column
    );

    if (value) {
      this.formValues[column.columnKey] = value;
    }
  }

  private stopFieldMic(apply = false): void {
    if (!this.listeningFieldKey) {
      return;
    }

    const column = this.columns.find(
      (item) => item.columnKey === this.listeningFieldKey
    );

    if (apply && column && this.fieldTranscript.trim()) {
      this.applyFieldTranscript(column);
    }

    this.fieldSpeechSubscription?.unsubscribe();
    this.fieldSpeechSubscription = undefined;
    this.speechService.stopListening();
    this.listeningFieldKey = null;
    this.fieldTranscript = '';
  }
}
