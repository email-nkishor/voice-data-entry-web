import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="search-bar">
      <input
        type="search"
        class="input"
        [placeholder]="placeholder"
        [(ngModel)]="searchText"
        (ngModelChange)="searchChange.emit($event)"
      />
    </div>
  `,
})
export class SearchBarComponent {
  @Input() placeholder = 'Search...';
  @Input() set value(term: string) {
    this.searchText = term;
  }
  @Output() searchChange = new EventEmitter<string>();
  searchText = '';
}
