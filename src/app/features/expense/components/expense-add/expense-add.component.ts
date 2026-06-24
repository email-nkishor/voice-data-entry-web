import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DynamicColumn } from '../../../../core/models/dynamic-column.model';
import { FormSchemaService } from '../../../../core/services/form-schema.service';
import { ToastService } from '../../../../core/services/toast.service';
import { validateModuleForm } from '../../../../core/utils/form-validation.util';
import { createEmptyFormValues } from '../../../../core/utils/voice-form.util';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { VoiceDynamicFormComponent } from '../../../../shared/components/voice-dynamic-form/voice-dynamic-form.component';
import { Expense } from '../../models/expense.model';
import { ExpenseService } from '../../services/expense.service';

@Component({
  selector: 'app-expense-add',
  standalone: true,
  imports: [FormsModule, ModuleActionHeaderComponent, VoiceDynamicFormComponent],
  templateUrl: './expense-add.component.html',
})
export class ExpenseAddComponent implements OnInit {
  private readonly moduleCode = 'expense' as const;

  columns: DynamicColumn[] = [];
  formValues: Record<string, string> = {};
  validationErrors: Record<string, string> = {};

  constructor(
    private formSchemaService: FormSchemaService,
    private expenseService: ExpenseService,
    private toastService: ToastService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.columns = await this.formSchemaService.getColumns(this.moduleCode);
    this.resetForm();
    if (!this.formValues['expenseDate']) {
      this.formValues['expenseDate'] = new Date().toISOString().split('T')[0];
    }
  }

  onReset(): void {
    this.validationErrors = {};
    this.resetForm();
    this.formValues['expenseDate'] = new Date().toISOString().split('T')[0];
  }

  async onSave(): Promise<void> {
    const validation = validateModuleForm(this.moduleCode, this.formValues);
    this.validationErrors = validation.errors;
    if (!validation.valid) {
      this.toastService.error(validation.message);
      return;
    }

    const expense: Expense = {
      expenseName: this.formValues['expenseName'] ?? '',
      amount: Number(this.formValues['amount'] ?? 0),
      expenseDate: this.formValues['expenseDate'] ?? new Date().toISOString().split('T')[0],
      remarks: this.formValues['remarks'] ?? '',
    };

    await this.expenseService.add(expense);
    this.toastService.success('Saved successfully');
    this.router.navigate(['/expense']);
  }

  private resetForm(): void {
    this.formValues = createEmptyFormValues(this.columns);
  }
}
