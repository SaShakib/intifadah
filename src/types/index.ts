/* ─────────────────────────────────────────────
   SHARED TYPES
   ───────────────────────────────────────────── */

export type UserRole = 'super_admin' | 'manager' | 'accountant' | 'user' | 'org';

export type TransactionType = 'collection' | 'loan' | 'repayment' | 'savings' | 'donation' | 'expense';

export type TransactionStatus = 'completed' | 'pending' | 'rejected' | 'overdue';

export type LoanStatus = 'active' | 'repaid' | 'overdue' | 'pending_approval';

export type CategoryType = 'donation' | 'savings' | 'loan' | 'expense';

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'one_time';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  initials: string;
  joinDate: string;
  address?: string;
  gender?: 'male' | 'female' | 'other';
  isActive: boolean;
}

export interface Member extends User {
  memberId: string;
  totalSavings: number;
  totalDonations: number;
  activeLoan?: number;
}

export interface Transaction {
  id: string;
  memberId: string;
  memberName: string;
  memberInitials: string;
  type: TransactionType;
  amount: number;
  categoryId?: string;
  categoryName?: string;
  date: string;
  status: TransactionStatus;
  note?: string;
}

export interface Loan {
  id: string;
  borrowerId: string;
  borrowerName: string;
  borrowerInitials: string;
  amount: number;
  purpose: string;
  issueDate: string;
  dueDate: string;
  status: LoanStatus;
  totalRepaid: number;
  installmentAmount?: number;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  description?: string;
  recurrence: RecurrenceType;
  amount?: number;
  isVariable: boolean;
  isActive: boolean;
}

export interface DashboardStats {
  totalMembers: number;
  totalFund: number;
  totalCollection: number;
  totalLoans: number;
  currentBalance: number;
  activeLoans: number;
}

export interface Permission {
  module: string;
  read: boolean;
  write: boolean;
  update: boolean;
  delete: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  assignedTo: string[];
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  message: string;
  date: string;
  isRead: boolean;
  isFromAdmin: boolean;
}

export interface ThemeId {
  id: 'default' | 'green' | 'blue' | 'teal';
  label: string;
  color: string;
}
