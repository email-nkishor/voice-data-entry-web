import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SyncBarComponent } from './shared/components/sync-bar/sync-bar.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, SyncBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly currentYear = new Date().getFullYear();
}
