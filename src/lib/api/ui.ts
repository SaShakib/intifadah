import type { Category, Loan, LoanStatus, Member, RecurrenceType, Transaction, TransactionStatus, TransactionType, UserRole } from '@/types';
import type { ApiAuthUser, ApiCategoryRow, ApiLoanRow, ApiTransactionRow, BackendRoleKey } from './types';

export function toMinorNumber(value: string | number | null | undefined) {
  if (typeof value === 'number') {
    return value;
  }

  if (!value) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function toBanglaDate(value: string | null | undefined) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('bn-BD', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function toInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return 'ই';
  }

  const first = parts[0]?.[0] ?? '';
  const second = parts[1]?.[0] ?? '';
  return `${first}${second}`.trim() || first;
}

export function toUserRole(roleKey: BackendRoleKey): UserRole {
  if (roleKey === 'super_admin') return 'super_admin';
  if (roleKey === 'admin') return 'admin';
  if (roleKey === 'manager') return 'manager';
  if (roleKey === 'member_internal') return 'member_internal';
  if (roleKey === 'org_user') return 'org';
  return 'user';
}

export function isAdminRoleKey(roleKey: BackendRoleKey) {
  return roleKey === 'super_admin' || roleKey === 'admin' || roleKey === 'manager' || roleKey === 'member_internal';
}

export function canManagePermissions(roleKey: BackendRoleKey | null | undefined) {
  return roleKey === 'super_admin' || roleKey === 'admin';
}

export function getRoleLabel(roleKey: BackendRoleKey | null | undefined, userKind?: number | null) {
  if (roleKey === 'super_admin') return 'সুপার অ্যাডমিন';
  if (roleKey === 'admin') return 'অ্যাডমিন';
  if (roleKey === 'manager') return 'ম্যানেজার';
  if (roleKey === 'member_internal') return 'ইনতিফাদাহ সদস্য';
  if (roleKey === 'org_user' || userKind === 3) return 'সংগঠন সদস্য';
  if (userKind === 1) return 'ইনতিফাদাহ সদস্য';
  return 'সাধারণ সদস্য';
}

export function mapAuthUserToMember(user: ApiAuthUser): Member {
  return {
    id: String(user.id),
    memberId: `INT-${String(user.id).padStart(3, '0')}`,
    name: user.fullName,
    phone: user.mobile,
    email: user.email ?? undefined,
    role: toUserRole(user.roleKey),
    avatar: user.photoUrl ?? undefined,
    initials: toInitials(user.fullName),
    joinDate: toBanglaDate(user.joinedOn),
    address: user.addressLine ?? undefined,
    gender: user.gender === 1 ? 'male' : user.gender === 2 ? 'female' : 'other',
    isActive: user.isActive,
    totalSavings: 0,
    totalDonations: 0,
    activeLoan: 0,
  };
}

export function mapTxType(txType: number): TransactionType {
  if (txType === 1 || txType === 9) return 'collection';
  if (txType === 2) return 'donation';
  if (txType === 3) return 'savings';
  if (txType === 4) return 'loan';
  if (txType === 5) return 'repayment';
  if (txType === 6 || txType === 7 || txType === 8) return 'expense';
  return 'collection';
}

export function mapTxStatus(status: number): TransactionStatus {
  if (status === 1) return 'completed';
  if (status === 2) return 'rejected';
  return 'pending';
}

export function mapLoanStatus(status: number): LoanStatus {
  if (status === 1) return 'active';
  if (status === 2) return 'repaid';
  if (status === 3) return 'overdue';
  return 'pending_approval';
}

export function mapCategoryType(categoryType: number): Category['type'] {
  if (categoryType === 1) return 'donation';
  if (categoryType === 2) return 'savings';
  if (categoryType === 3) return 'loan';
  return 'expense';
}

export function mapRecurrenceType(recurrenceType: number): RecurrenceType {
  if (recurrenceType === 1) return 'daily';
  if (recurrenceType === 2) return 'weekly';
  if (recurrenceType === 3) return 'monthly';
  if (recurrenceType === 4) return 'yearly';
  return 'one_time';
}

export function mapTransactionRow(row: ApiTransactionRow): Transaction {
  return {
    id: String(row.id),
    memberId: String(row.subject_user_id),
    memberName: row.subject_name ?? `সদস্য #${row.subject_user_id}`,
    memberInitials: toInitials(row.subject_name ?? `S ${row.subject_user_id}`),
    type: mapTxType(row.tx_type),
    amount: toMinorNumber(row.amount_minor),
    categoryId: row.category_id ? String(row.category_id) : undefined,
    categoryName: row.category_name ?? undefined,
    date: toBanglaDate(row.occurred_on),
    status: mapTxStatus(row.status),
    note: row.note ?? undefined,
  };
}

export function mapLoanRow(row: ApiLoanRow): Loan {
  return {
    id: String(row.id),
    borrowerId: String(row.borrower_user_id),
    borrowerName: row.borrower_name,
    borrowerInitials: toInitials(row.borrower_name),
    amount: toMinorNumber(row.principal_minor),
    purpose: row.purpose,
    issueDate: toBanglaDate(row.issued_on ?? row.requested_on),
    dueDate: toBanglaDate(row.due_on),
    status: mapLoanStatus(row.status),
    totalRepaid: toMinorNumber(row.total_repaid_minor),
    installmentAmount: row.term_days && row.term_days > 0
      ? Math.round(toMinorNumber(row.principal_minor) / Math.max(1, Math.round(row.term_days / 30)))
      : undefined,
  };
}

export function mapCategoryRow(row: ApiCategoryRow): Category {
  return {
    id: String(row.id),
    name: row.category_name,
    type: mapCategoryType(row.category_type),
    description: row.description ?? undefined,
    recurrence: mapRecurrenceType(row.recurrence_type),
    amount: row.amount_fixed !== null ? toMinorNumber(row.amount_fixed) : undefined,
    isVariable: row.is_amount_variable,
    isActive: row.is_active,
  };
}
