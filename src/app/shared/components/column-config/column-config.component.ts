import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DynamicColumn, DynamicFieldType } from '../../../core/models/dynamic-column.model';
import { FormSchemaService } from '../../../core/services/form-schema.service';
import { ToastService } from '../../../core/services/toast.service';
import { ModuleActionHeaderComponent } from '../module-action-header/module-action-header.component';

@Component({
  selector: 'app-column-config',
  standalone: true,
  imports: [FormsModule, ModuleActionHeaderComponent],
  templateUrl: './column-config.component.html',
})
export class ColumnConfigComponent implements OnInit {
  moduleCode = 'student';
  pageTitle = 'Configure Columns';

  columns: DynamicColumn[] = [];
  newColumnKey = '';
  newColumnLabel = '';
  newColumnKeywords = '';
  newColumnFieldType: DynamicFieldType = 'text';

  editingColumnId: number | null = null;
  editKeywords = '';
  editFieldType: DynamicFieldType = 'text';

  readonly fieldTypes: DynamicFieldType[] = [
    'text',
    'number',
    'phone',
    'multiline',
  ];

  private readonly moduleBackLinks: Record<string, string> = {
    student: '/student/dashboard',
    expense: '/expense',
    attendance: '/attendance',
    inventory: '/inventory',
    survey: '/survey',
    patient: '/patient',
  };

  get moduleBackLink(): string {
    return this.moduleBackLinks[this.moduleCode] ?? '/dashboard';
  }

  constructor(
    private route: ActivatedRoute,
    private formSchemaService: FormSchemaService,
    private toastService: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    this.moduleCode = this.route.snapshot.data['moduleCode'] ?? 'student';
    this.pageTitle = this.route.snapshot.data['title'] ?? 'Configure Columns';
    await this.loadColumns();
  }

  async loadColumns(): Promise<void> {
    this.columns = await this.formSchemaService.getColumns(this.moduleCode);
  }

  canDelete(column: DynamicColumn): boolean {
    return this.formSchemaService.canDeleteColumn(column);
  }

  canEditVoice(column: DynamicColumn): boolean {
    return this.formSchemaService.canEditVoice(column);
  }

  async onAddColumn(): Promise<void> {
    const columnKey = this.newColumnKey.trim();
    const label = this.newColumnLabel.trim();
    const keywords = this.newColumnKeywords
      .split(',')
      .map((keyword) => keyword.trim())
      .filter(Boolean);

    if (!columnKey || !label || !keywords.length) {
      this.toastService.error('Field key, label, and voice keywords are required');
      return;
    }

    await this.formSchemaService.addColumn(this.moduleCode, {
      columnKey,
      label,
      speechKeywords: keywords,
      fieldType: this.newColumnFieldType,
      sortOrder: this.columns.length,
      allowDelete: true,
      isSystemField: false,
    });

    this.newColumnKey = '';
    this.newColumnLabel = '';
    this.newColumnKeywords = '';
    this.newColumnFieldType = 'text';
    await this.loadColumns();
    this.toastService.success('Column added');
  }

  startEdit(column: DynamicColumn): void {
    if (!column.id || !this.canEditVoice(column)) {
      return;
    }
    this.editingColumnId = column.id;
    this.editKeywords = column.speechKeywords.join(', ');
    this.editFieldType = column.fieldType;
  }

  cancelEdit(): void {
    this.editingColumnId = null;
    this.editKeywords = '';
    this.editFieldType = 'text';
  }

  async saveEdit(column: DynamicColumn): Promise<void> {
    if (!column.id) {
      return;
    }

    const keywords = this.editKeywords
      .split(',')
      .map((keyword) => keyword.trim())
      .filter(Boolean);

    if (!keywords.length) {
      this.toastService.error('At least one voice keyword is required');
      return;
    }

    await this.formSchemaService.updateColumn(column.id, {
      speechKeywords: keywords,
      fieldType: this.editFieldType,
    });

    this.cancelEdit();
    await this.loadColumns();
    this.toastService.success('Voice settings updated');
  }

  async onDeleteColumn(column: DynamicColumn): Promise<void> {
    if (!column.id || !this.canDelete(column)) {
      this.toastService.error('This field cannot be removed');
      return;
    }

    try {
      await this.formSchemaService.deleteColumn(column.id);
      await this.loadColumns();
      this.toastService.success('Column removed');
    } catch {
      this.toastService.error('This field cannot be removed');
    }
  }

  getKeywordsLabel(column: DynamicColumn): string {
    return column.speechKeywords.join(', ');
  }

  isEditing(column: DynamicColumn): boolean {
    return column.id === this.editingColumnId;
  }
}
