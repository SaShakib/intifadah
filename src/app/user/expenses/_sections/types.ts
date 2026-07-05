export interface ExpenseMetric {
  label: string;
  value: string;
  hint: string;
}

export interface ExpenseRow {
  date: string;
  category: string;
  amount: number;
  note: string;
}
