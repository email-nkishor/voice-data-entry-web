import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpeechEngine } from '../../../core/models/speech-engine.model';
import { SpeechSettingsService } from '../../../core/services/speech-settings.service';

@Component({
  selector: 'app-speech-engine-selector',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './speech-engine-selector.component.html',
  styleUrl: './speech-engine-selector.component.scss',
})
export class SpeechEngineSelectorComponent {
  apiKey = '';

  constructor(public speechSettings: SpeechSettingsService) {
    this.refreshApiKey();
  }

  get selectedEngine(): SpeechEngine {
    return this.speechSettings.engine;
  }

  onEngineChange(engine: SpeechEngine): void {
    this.speechSettings.setEngine(engine);
    this.refreshApiKey();
  }

  onApiKeyChange(value: string): void {
    this.apiKey = value;
    const option = this.speechSettings.selectedOption;
    if (option.needsApiKey) {
      this.speechSettings.setApiKey(option, value);
    }
  }

  private refreshApiKey(): void {
    const option = this.speechSettings.selectedOption;
    this.apiKey = option.needsApiKey ? this.speechSettings.getApiKey(option) : '';
  }
}
