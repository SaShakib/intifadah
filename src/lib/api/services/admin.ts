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
  ApiSummaryResponse,
  ApiTransactionRow,
} from '../types';

export function getAdminDashboardSummary() {
  return apiRequest<ApiSummaryResponse>('/admin/dashboard/summary');
}

export async function getAdminMembers(params: { limit?: number; offset?: number; search?: string; active?: boolean } = {}) {
  const query = createQueryString(params);
  const data = await apiRequest<ApiRowsResponse<ApiAdminMemberRow>>(`/admin/members${query}`);
  return data.rows;
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

export async function getAdminCollections(params: { limit?: number; offset?: number; status?: number; fromDate?: string; toDate?: string } = {}) {
  const query = createQueryString(params);
  const data = await apiRequest<ApiRowsResponse<ApiTransactionRow>>(`/admin/collections${query}`);
  return data.rows;
}

export async function getAdminLoans(params: { status?: number | string; fromDate?: string; toDate?: string } = {}) {
  const query = createQueryString(params);
  const data = await apiRequest<ApiRowsResponse<ApiLoanRow>>(`/admin/loans${query}`);
  return data.rows;
}

export async function getLoanRepayments(loanId: string | number) {
  const data = await apiRequest<ApiRowsResponse<ApiLoanRepaymentRow>>(`/admin/loans/${loanId}/repayments`);
  return data.rows;
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

export async function getCommentThreads() {
  const data = await apiRequest<ApiRowsResponse<ApiCommentThreadRow>>('/admin/comments/threads');
  return data.rows;
}

export async function getCommentMessages(threadId: string | number) {
  const data = await apiRequest<ApiRowsResponse<ApiCommentMessageRow>>(`/admin/comments/threads/${threadId}/messages`);
  return data.rows;
}
