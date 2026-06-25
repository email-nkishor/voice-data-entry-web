import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { ToastService } from '../../../../core/services/toast.service';
import {
  CUSTOM_FIELD_TYPES,
  CustomFieldDefinition,
  CustomFieldDefinitionInput,
  CustomFieldType,
  CustomFieldValidationRules,
} from '../../../../core/models/custom-field.model';
import { CustomFieldService } from '../../../../core/services/custom-field.service';

@Component({
  selector: 'app-custom-field-list',
  standalone: true,
  imports: [FormsModule, ModuleActionHeaderComponent],
  templateUrl: './custom-field-list.component.html',
  styleUrl: './custom-field-list.component.scss',
})
export class CustomFieldListComponent implements OnInit {
  definitions: CustomFieldDefinition[] = [];
  loading = true;
  showForm = false;
  saving = false;
  fieldTypes = CUSTOM_FIELD_TYPES;

  form: CustomFieldDefinitionInput = {
    fieldLabel: '',
    fieldType: 'text',
    isRequired: false,
    validationRules: {},
  };

  optionsText = '';

  constructor(
    private customFieldService: CustomFieldService,
    private toast: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadDefinitions();
  }

  async loadDefinitions(): Promise<void> {
    this.loading = true;
    try {
      this.definitions = await this.customFieldService.listDefinitions('student', true);
    } catch {
      this.toast.error('Failed to load custom fields');
    } finally {
      this.loading = false;
    }
  }

  openForm(): void {
    this.form = {
      fieldLabel: '',
      fieldType: 'text',
      isRequired: false,
      validationRules: {},
    };
    this.optionsText = '';
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  onTypeChange(): void {
    if (this.form.fieldType === 'dropdown' || this.form.fieldType === 'multiselect') {
      this.optionsText = 'Option 1\nOption 2';
    }
  }

  private buildOptions(): CustomFieldValidationRules {
    const rules: CustomFieldValidationRules = { ...this.form.validationRules };
    if (this.form.fieldType === 'dropdown' || this.form.fieldType === 'multiselect') {
      rules.options = this.optionsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [value, label] = line.split('|').map((s) => s.trim());
          return { value: value || line, label: label || value || line };
        });
    }
    return rules;
  }

  async saveDefinition(): Promise<void> {
    if (!this.form.fieldLabel.trim()) {
      this.toast.error('Field label is required');
      return;
    }
    this.saving = true;
    try {
      const payload: CustomFieldDefinitionInput = {
        ...this.form,
        entityType: 'student',
        validationRules: this.buildOptions(),
      };
      await this.customFieldService.createDefinition(payload);
      this.toast.success('Custom field created');
      this.showForm = false;
      await this.loadDefinitions();
    } catch {
      this.toast.error('Failed to create custom field');
    } finally {
      this.saving = false;
    }
  }

  async deactivate(def: CustomFieldDefinition): Promise<void> {
    if (!confirm(`Deactivate "${def.fieldLabel}"?`)) {
      return;
    }
    try {
      await this.customFieldService.deactivateDefinition(def.id);
      this.toast.success('Field deactivated');
      await this.loadDefinitions();
    } catch {
      this.toast.error('Failed to deactivate field');
    }
  }

  async moveUp(index: number): Promise<void> {
    if (index <= 0) {
      return;
    }
    const items = [...this.definitions];
    [items[index - 1], items[index]] = [items[index], items[index - 1]];
    await this.applyOrder(items);
  }

  async moveDown(index: number): Promise<void> {
    if (index >= this.definitions.length - 1) {
      return;
    }
    const items = [...this.definitions];
    [items[index], items[index + 1]] = [items[index + 1], items[index]];
    await this.applyOrder(items);
  }

  private async applyOrder(items: CustomFieldDefinition[]): Promise<void> {
    try {
      this.definitions = await this.customFieldService.reorderDefinitions(
        items.map((d) => d.id),
        'student'
      );
    } catch {
      this.toast.error('Failed to reorder fields');
    }
  }

  typeLabel(type: CustomFieldType): string {
    return this.fieldTypes.find((t) => t.value === type)?.label ?? type;
  }
}
