import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { Expense } from '../../models/expense.model';
import { ExpenseService } from '../../services/expense.service';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [RouterLink, ModuleActionHeaderComponent],
  template: `
    <div class="page">
      <app-module-action-header title="Expenses" backLink="/dashboard" />
      <div class="toolbar"><a routerLink="/expense/add" class="btn btn-primary">+ Add Expense</a></div>
      <div class="list">
        @for (expense of expenses; track expense.id) {
          <article class="card list-item">
            <h3>{{ expense.expenseName }}</h3>
            <p>Amount: {{ expense.amount }}</p>
            <p>Date: {{ expense.expenseDate }}</p>
            <p>{{ expense.remarks }}</p>
          </article>
        } @empty { <p class="empty">No expenses recorded.</p> }
      </div>
    </div>
  `,
})
export class ExpenseListComponent implements OnInit {
  expenses: Expense[] = [];
  constructor(private expenseService: ExpenseService) {}
  async ngOnInit(): Promise<void> { this.expenses = await this.expenseService.getAll(); }
}
