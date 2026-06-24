export interface Expense {
  id?: number;
  expenseName: string;
  amount: number;
  expenseDate: string;
  remarks: string;
  syncStatus?: 'pending' | 'synced';
}
