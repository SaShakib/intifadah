import { apiRequest, createQueryString } from '../client';
import type {
  ApiAccessModuleRow,
  ApiAccessRoleRow,
  ApiCategoryRow,
  ApiCommentMessageRow,
  ApiCommentThreadRow,
  ApiLoanRepaymentRow,
  ApiLoanRow,
  ApiMemberFinancialSummaryRow,
  ApiAdminMemberRow,
  ApiReportCollectionRow,
  ApiReportDueRow,
  ApiRolePermissionRow,
  ApiRowsResponse,
  ApiQuranWeeklyReportResponse,
  ApiQuranPenaltyReportResponse,
  ApiQuranPenaltyRunResponse,
  ApiSummaryResponse,
  ApiTransactionRow,
  AdminMemberInput,
  CategoryInput,
  CollectionInput,
  LoanInput,
  LoanRepaymentInput,
  ApiRowResponse,
  ApiDataResponse,
} from '../types';

export function getAdminDashboardSummary() {
  return apiRequest<ApiSummaryResponse>('/admin/dashboard/summary');
}

export async function getAdminMembers(params: { limit?: number; offset?: number; search?: string; active?: boolean } = {}) {
  const query = createQueryString(params);
  const data = await apiRequest<ApiRowsResponse<ApiAdminMemberRow>>(`/admin/members${query}`);
  return data.rows;
}

export async function createAdminMember(input: AdminMemberInput) {
  const data = await apiRequest<ApiRowResponse<ApiAdminMemberRow>>('/admin/members', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.row;
}

export async function updateAdminMember(userId: string | number, input: Partial<AdminMemberInput>) {
  const data = await apiRequest<ApiRowResponse<ApiAdminMemberRow>>(`/admin/members/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return data.row;
}

export async function deactivateAdminMember(userId: string | number) {
  const data = await apiRequest<ApiRowResponse<ApiAdminMemberRow>>(`/admin/members/${userId}`, {
    method: 'DELETE',
  });
  return data.row;
}

export async function getMemberFinancialSummary() {
  const data = await apiRequest<ApiRowsResponse<ApiMemberFinancialSummaryRow>>('/admin/members/financial-summary');
  return data.rows;
}

export async function getAdminCategories(params: { active?: boolean; categoryType?: number } = {}) {
  const query = createQueryString(params);
  const data = await apiRequest<ApiRowsResponse<ApiCategoryRow>>(`/admin/categories${query}`);
  return data.rows;
}

export async function createAdminCategory(input: CategoryInput) {
  const data = await apiRequest<ApiRowResponse<ApiCategoryRow>>('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.row;
}

export async function updateAdminCategory(categoryId: string | number, input: Partial<CategoryInput>) {
  const data = await apiRequest<ApiRowResponse<ApiCategoryRow>>(`/admin/categories/${categoryId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return data.row;
}

export async function deleteAdminCategory(categoryId: string | number) {
  const data = await apiRequest<ApiRowResponse<ApiCategoryRow>>(`/admin/categories/${categoryId}`, {
    method: 'DELETE',
  });
  return data.row;
}

export async function getAdminCollections(params: { limit?: number; offset?: number; status?: number; fromDate?: string; toDate?: string } = {}) {
  const query = createQueryString(params);
  const data = await apiRequest<ApiRowsResponse<ApiTransactionRow>>(`/admin/collections${query}`);
  return data.rows;
}

export async function createAdminCollection(input: CollectionInput) {
  const data = await apiRequest<ApiRowResponse<ApiTransactionRow>>('/admin/collections', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.row;
}

export async function getAdminLoans(params: { status?: number | string; fromDate?: string; toDate?: string } = {}) {
  const query = createQueryString(params);
  const data = await apiRequest<ApiRowsResponse<ApiLoanRow>>(`/admin/loans${query}`);
  return data.rows;
}

export async function createAdminLoan(input: LoanInput) {
  const data = await apiRequest<ApiRowResponse<ApiLoanRow>>('/admin/loans', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.row;
}

export async function approveAdminLoan(loanId: string | number, input: { issuedOn?: string; note?: string } = {}) {
  const data = await apiRequest<ApiDataResponse<{ loanId: string | number; disbursementTxId: string | number }>>(`/admin/loans/${loanId}/approve`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.data;
}

export async function getLoanRepayments(loanId: string | number) {
  const data = await apiRequest<ApiRowsResponse<ApiLoanRepaymentRow>>(`/admin/loans/${loanId}/repayments`);
  return data.rows;
}

export async function createAdminLoanRepayment(loanId: string | number, input: LoanRepaymentInput) {
  const data = await apiRequest<ApiDataResponse<{ loanId: string | number; repaymentTxId: string | number; totalRepaidMinor: number; status: number }>>(`/admin/loans/${loanId}/repayments`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.data;
}

export async function getAdminReportPeriodCollections(params: { fromDate?: string; toDate?: string } = {}) {
  const query = createQueryString(params);
  const data = await apiRequest<ApiRowsResponse<ApiReportCollectionRow>>(`/admin/reports/period-collections${query}`);
  return data.rows;
}

export async function getAdminReportCategoryDue() {
  const data = await apiRequest<ApiRowsResponse<ApiReportDueRow>>('/admin/reports/categories/due-summary');
  return data.rows;
}

export async function getRolesPermissions() {
  const data = await apiRequest<ApiRowsResponse<ApiRolePermissionRow>>('/admin/access-control/matrix');
  return data.rows;
}

export async function getAccessRoles() {
  const data = await apiRequest<ApiRowsResponse<ApiAccessRoleRow>>('/admin/access-control/roles');
  return data.rows;
}

export async function getAccessModules() {
  const data = await apiRequest<ApiRowsResponse<ApiAccessModuleRow>>('/admin/access-control/modules');
  return data.rows;
}

export async function assignAdminUserRole(userId: string | number, roleKey: string) {
  const data = await apiRequest<ApiDataResponse<{ userId: string | number; roleId: number; roleKey: string; roleName: string; changed: boolean }>>(`/admin/access-control/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ roleKey }),
  });
  return data.data;
}

export async function updateAdminRolePermissions(roleKey: string, permissions: Array<{ moduleKey: string; actions: Array<'read' | 'write' | 'update' | 'delete'> }>) {
  const data = await apiRequest<{ message: string; roleKey: string; replaceAll: boolean; rows: unknown[] }>(`/admin/access-control/roles/${roleKey}/permissions`, {
    method: 'PUT',
    body: JSON.stringify({ permissions, replaceAll: false }),
  });
  return data.rows;
}

export async function getCommentThreads() {
  const data = await apiRequest<ApiRowsResponse<ApiCommentThreadRow>>('/admin/comments/threads');
  return data.rows;
}

export async function getCommentMessages(threadId: string | number) {
  const data = await apiRequest<ApiRowsResponse<ApiCommentMessageRow>>(`/admin/comments/threads/${threadId}/messages`);
  return data.rows;
}

export function getAdminQuranWeeklyReport(params: { fromDate?: string; toDate?: string } = {}) {
  const query = createQueryString(params);
  return apiRequest<ApiQuranWeeklyReportResponse>(`/admin/quran/weekly-report${query}`);
}

export function getAdminQuranPenalties(params: { fromDate?: string; toDate?: string; limit?: number } = {}) {
  const query = createQueryString(params);
  return apiRequest<ApiQuranPenaltyReportResponse>(`/admin/quran/penalties${query}`);
}

export function runAdminQuranPenalties(input: { fromDate?: string; toDate?: string } = {}) {
  return apiRequest<ApiQuranPenaltyRunResponse>('/admin/quran/run-penalties', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function sendAdminQuranReminder() {
  return apiRequest<ApiDataResponse<{ notifiedUsers: number }>>('/admin/quran/send-reminder', {
    method: 'POST',
  });
}
