import { Injectable } from '@angular/core';

const RESET_COMMANDS = [
  'reset',
  're entry',
  're-entry',
  'reentry',
  'clear form',
  'clear all',
  'start over',
  'start again',
  'रीसेट',
  'फिर से',
  'दोबारा',
  'साफ करो',
  'clear',
];

@Injectable({ providedIn: 'root' })
export class VoiceCommandService {
  isResetCommand(text: string): boolean {
    const normalized = text.toLowerCase().trim();
    if (!normalized) {
      return false;
    }

    return RESET_COMMANDS.some((command) => {
      const pattern = new RegExp(`(^|\\s)${this.escapeRegex(command)}(\\s|$)`, 'i');
      return pattern.test(normalized) || normalized === command;
    });
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
