import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  text: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastSubject = new Subject<ToastMessage>();
  readonly toast$ = this.toastSubject.asObservable();

  success(text: string): void {
    this.show(text, 'success');
  }

  error(text: string): void {
    this.show(text, 'error');
  }

  info(text: string): void {
    this.show(text, 'info');
  }

  private show(text: string, type: ToastMessage['type']): void {
    this.toastSubject.next({ text, type });
  }
}
