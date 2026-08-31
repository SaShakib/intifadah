import type { UserRole } from '@/types';

export type BackendRoleKey = 'super_admin' | 'admin' | 'manager' | 'member_internal' | 'general_user' | 'org_user';

export interface ApiAuthUser {
  id: number;
  fullName: string;
  mobile: string;
  email: string | null;
  userKind: number;
  roleId: number;
  roleKey: BackendRoleKey;
  roleName: string;
  organizationId: number | null;
  gender: number;
  addressLine: string | null;
  wardNo: number | null;
  photoUrl: string | null;
  authProvider: string;
  googleSub: string | null;
  needsProfileCompletion: boolean;
  isActive: boolean;
  joinedOn: string;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface ApiTokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenType: 'Bearer';
  accessExpiresIn: string;
  refreshExpiresAt: string;
}

export interface ApiAuthResponse {
  user: ApiAuthUser;
  tokens: ApiTokenPair;
}

export interface AuthSession {
  user: ApiAuthUser;
  tokens: ApiTokenPair;
}

export interface ApiMessageResponse {
  message: string;
  requestId?: string;
}

export interface ApiRowsResponse<T> {
  rows: T[];
}

export interface ApiRowResponse<T> {
  row: T;
}

export interface ApiDataResponse<T> {
  data: T;
}

export interface ApiSummaryResponse {
  totalMembers: number;
  totalCollectionMinor: string | number;
  totalLoanDistributedMinor: string | number;
  currentBalanceMinor: string | number;
}

export interface ApiAdminMemberRow {
  id: number;
  full_name: string;
  mobile: string;
  email: string | null;
  user_kind: number;
  is_active: boolean;
  joined_on: string;
  photo_url: string | null;
  role_key: BackendRoleKey;
  role_name: string;
  total_deposit_minor: string | number;
  total_withdraw_minor: string | number;
  total_repaid_minor: string | number;
  temporary_password?: string;
  email_send_error?: string;
}

export interface ApiMemberFinancialSummaryRow {
  user_id: number;
  full_name: string;
  total_deposit_minor: string | number;
  total_withdraw_minor: string | number;
  total_repaid_minor: string | number;
  current_due_minor: string | number;
}

export interface ApiCategoryRow {
  id: number;
  category_name: string;
  category_type: number;
  recurrence_type: number;
  due_interval_days: number | null;
  amount_fixed: string | number | null;
  is_amount_variable: boolean;
  description: string | null;
  is_active: boolean;
  created_by_user_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface ApiTransactionRow {
  id: string | number;
  tx_type: number;
  status: number;
  actor_user_id: number;
  subject_user_id: number;
  category_id: number | null;
  amount_minor: string | number;
  occurred_on: string;
  approved_by_user_id: number | null;
  approved_at: string | null;
  note: string | null;
  created_at: string;
  updated_at?: string;
  actor_name?: string;
  subject_name?: string;
  category_name?: string | null;
}

export interface ApiLoanRow {
  id: string | number;
  borrower_user_id: number;
  borrower_name: string;
  category_id: number | null;
  category_name: string | null;
  principal_minor: string | number;
  purpose: string;
  requested_on: string;
  issued_on: string | null;
  due_on: string;
  term_days: number | null;
  status: number;
  disbursed_tx_id: string | number | null;
  approved_by_user_id: number | null;
  approved_at: string | null;
  total_repaid_minor: string | number;
  created_at: string;
  updated_at: string;
}

export interface ApiLoanRepaymentRow {
  id: string | number;
  loan_id: string | number;
  repayment_tx_id: string | number;
  amount_minor: string | number;
  paid_on: string;
  recorded_by_user_id: number | null;
  note: string | null;
  created_at: string;
}

export interface ApiReportCollectionRow {
  tx_type: number;
  total_minor: string | number;
  total_count: number;
}

export interface ApiReportDueRow {
  category_id: number;
  category_name: string;
  loan_count: number;
  due_minor: string | number;
}

export interface ApiAccessRoleRow {
  id: number;
  role_key: BackendRoleKey;
  role_name: string;
  is_internal: boolean;
}

export interface ApiAccessModuleRow {
  id: number;
  module_key: string;
  module_name: string;
}

export interface ApiRolePermissionItem {
  moduleId: number;
  moduleKey: string;
  moduleName: string;
  permMask: number;
  actions: Array<'read' | 'write' | 'update' | 'delete'>;
}

export interface ApiRolePermissionRow {
  roleId: number;
  roleKey: BackendRoleKey;
  roleName: string;
  permissions: ApiRolePermissionItem[];
}

export interface ApiCommentThreadRow {
  id: string | number;
  subject: string;
  created_by_user_id: number;
  created_by_name?: string;
  assigned_to_user_id: number | null;
  assigned_to_name?: string | null;
  status: number;
  created_at: string;
  updated_at: string;
  message_count?: number;
  last_message_at?: string | null;
}

export interface ApiCommentMessageRow {
  id: string | number;
  thread_id: string | number;
  sender_user_id: number;
  sender_name: string;
  message_body: string;
  is_internal: boolean;
  created_at: string;
}

export interface ApiNotificationRow {
  id: string | number;
  recipient_user_id: number;
  notif_type: number;
  payload_json: Record<string, unknown> | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface ApiQuranProgressRow {
  id: string | number;
  user_id: number;
  progress_date: string;
  pages_read: number | null;
  surah_name: string | null;
  minutes_read: number | null;
  note: string | null;
  is_done: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiQuranWeeklyReportRow {
  user_id: number;
  full_name: string;
  mobile: string;
  days: Record<string, {
    done: boolean;
    pagesRead: number | null;
    surahName: string | null;
    minutesRead: number | null;
    note: string | null;
  }> | null;
}

export interface ApiQuranWeeklyReportResponse {
  fromDate: string;
  toDate: string;
  rows: ApiQuranWeeklyReportRow[];
}

export interface ApiQuranPenaltyRow {
  id: string | number;
  run_id: string | number;
  user_id: number;
  full_name: string;
  mobile: string;
  from_date: string;
  to_date: string;
  missed_days: number;
  penalty_minor: string | number;
  transaction_id: string | number | null;
  created_at: string;
}

export interface ApiQuranPenaltyReportResponse {
  rows: ApiQuranPenaltyRow[];
  totalPenaltyMinor: number;
  totalMissedDays: number;
}

export interface ApiQuranPenaltyRunResponse {
  skipped: boolean;
  fromDate: string;
  toDate: string;
  penalties: ApiQuranPenaltyRow[];
}

export interface LoginInput {
  identifier: string;
  password: string;
}

export interface RegisterInput {
  fullName: string;
  mobile: string;
  email?: string;
  password?: string;
  userKind?: 1 | 2 | 3;
  gender?: number;
  addressLine?: string;
  wardNo?: number;
  photoUrl?: string;
}

export interface GoogleLoginInput {
  idToken: string;
  fullName?: string;
  mobile?: string;
  addressLine?: string;
  wardNo?: number;
  photoUrl?: string;
}

export interface UpdateProfileInput {
  fullName?: string;
  mobile?: string;
  email?: string;
  gender?: number;
  addressLine?: string;
  wardNo?: number;
  photoUrl?: string;
}

export interface CompleteProfileInput {
  fullName: string;
  mobile: string;
  addressLine: string;
  gender?: number;
  wardNo?: number;
}

export interface AdminMemberInput {
  fullName: string;
  mobile: string;
  email?: string;
  password?: string;
  userKind?: 1 | 2 | 3;
  roleKey?: BackendRoleKey;
  organizationId?: number;
  gender?: number;
  addressLine?: string;
  wardNo?: number;
  photoUrl?: string;
  isActive?: boolean;
}

export interface CategoryInput {
  categoryName: string;
  categoryType: number;
  recurrenceType?: number;
  dueIntervalDays?: number | null;
  amountFixed?: number | null;
  isAmountVariable?: boolean;
  description?: string;
  isActive?: boolean;
}

export interface CollectionInput {
  subjectUserId: number;
  txType?: number;
  status?: number;
  categoryId?: number | null;
  amountMinor: number;
  occurredOn?: string;
  note?: string;
}

export interface LoanInput {
  borrowerUserId: number;
  categoryId: number;
  principalMinor: number;
  purpose: string;
  requestedOn?: string;
  dueOn: string;
  termDays?: number | null;
  status?: number;
}

export interface LoanRepaymentInput {
  amountMinor: number;
  paidOn?: string;
  note?: string;
}

export interface UserTransactionInput {
  txType?: number;
  categoryId?: number | null;
  amountMinor: number;
  occurredOn?: string;
  note?: string;
}

export interface UserLoanInput {
  categoryId: number;
  principalMinor: number;
  purpose: string;
  requestedOn?: string;
  dueOn: string;
  termDays?: number | null;
}

export interface UserExpenseInput {
  categoryId?: number | null;
  amountMinor: number;
  occurredOn?: string;
  note?: string;
}

export interface QuranProgressInput {
  progressDate?: string;
  pagesRead?: number | null;
  surahName?: string;
  minutesRead?: number | null;
  note?: string;
}

export interface ApiClientOptions {
  withAuth?: boolean;
  retryOnAuthError?: boolean;
}

export interface ApiRequestErrorBody {
  message?: string;
  requestId?: string;
}

export type ApiUserRole = UserRole;
