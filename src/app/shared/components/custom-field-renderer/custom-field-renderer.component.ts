import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CustomFieldDefinition,
  CustomFieldType,
  formatCustomFieldDisplay,
} from '../../../core/models/custom-field.model';

@Component({
  selector: 'app-custom-field-renderer',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './custom-field-renderer.component.html',
  styleUrl: './custom-field-renderer.component.scss',
})
export class CustomFieldRendererComponent {
  @Input() definitions: CustomFieldDefinition[] = [];
  @Input() values: Record<string, unknown> = {};
  @Input() errors: Record<string, string> = {};
  @Input() readonly = false;
  @Input() title = 'Organization Fields';

  @Output() valuesChange = new EventEmitter<Record<string, unknown>>();

  trackDef(_index: number, def: CustomFieldDefinition): number {
    return def.id;
  }

  setValue(fieldName: string, value: unknown): void {
    if (this.readonly) {
      return;
    }
    this.values = { ...this.values, [fieldName]: value };
    this.valuesChange.emit(this.values);
  }

  isMultiselectChecked(fieldName: string, optionValue: string): boolean {
    const val = this.values[fieldName];
    if (Array.isArray(val)) {
      return val.includes(optionValue);
    }
    return String(val ?? '')
      .split(',')
      .map((s) => s.trim())
      .includes(optionValue);
  }

  toggleMultiselect(fieldName: string, optionValue: string, checked: boolean): void {
    const current = this.values[fieldName];
    let arr = Array.isArray(current)
      ? [...current.map(String)]
      : String(current ?? '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    if (checked && !arr.includes(optionValue)) {
      arr.push(optionValue);
    }
    if (!checked) {
      arr = arr.filter((v) => v !== optionValue);
    }
    this.setValue(fieldName, arr);
  }

  fieldTypeLabel(type: CustomFieldType): string {
    return type.replace('_', ' ');
  }

  displayValue(def: CustomFieldDefinition): string {
    return formatCustomFieldDisplay(def, this.values[def.fieldName]);
  }
}
