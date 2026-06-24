import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DynamicColumn } from '../../../../core/models/dynamic-column.model';
import { FormSchemaService } from '../../../../core/services/form-schema.service';
import { ToastService } from '../../../../core/services/toast.service';
import { validateModuleForm } from '../../../../core/utils/form-validation.util';
import { createEmptyFormValues } from '../../../../core/utils/voice-form.util';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { VoiceDynamicFormComponent } from '../../../../shared/components/voice-dynamic-form/voice-dynamic-form.component';
import { InventoryItem } from '../../models/inventory.model';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-inventory-add',
  standalone: true,
  imports: [ModuleActionHeaderComponent, VoiceDynamicFormComponent],
  templateUrl: './inventory-add.component.html',
})
export class InventoryAddComponent implements OnInit {
  private readonly moduleCode = 'inventory' as const;

  columns: DynamicColumn[] = [];
  formValues: Record<string, string> = {};
  validationErrors: Record<string, string> = {};

  constructor(
    private formSchemaService: FormSchemaService,
    private inventoryService: InventoryService,
    private toastService: ToastService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.columns = await this.formSchemaService.getColumns(this.moduleCode);
    this.resetForm();
    this.formValues['purchaseDate'] = new Date().toISOString().split('T')[0];
  }

  onReset(): void {
    this.validationErrors = {};
    this.resetForm();
    this.formValues['purchaseDate'] = new Date().toISOString().split('T')[0];
  }

  async onSave(): Promise<void> {
    const validation = validateModuleForm(this.moduleCode, this.formValues);
    this.validationErrors = validation.errors;
    if (!validation.valid) {
      this.toastService.error(validation.message);
      return;
    }

    const item: InventoryItem = {
      itemName: this.formValues['itemName'] ?? '',
      quantity: Number(this.formValues['quantity'] ?? 0),
      purchaseDate: this.formValues['purchaseDate'] ?? new Date().toISOString().split('T')[0],
    };

    await this.inventoryService.add(item);
    this.toastService.success('Saved successfully');
    this.router.navigate(['/inventory']);
  }

  private resetForm(): void {
    this.formValues = createEmptyFormValues(this.columns);
  }
}
