import { apiRequest, createQueryString } from '../client';
import type {
  ApiCategoryRow,
  ApiCommentMessageRow,
  ApiCommentThreadRow,
  ApiLoanRepaymentRow,
  ApiLoanRow,
  ApiNotificationRow,
  ApiRowsResponse,
  ApiSummaryResponse,
  ApiTransactionRow,
  ApiAuthUser,
  UpdateProfileInput,
  ApiRowResponse,
} from '../types';

export function getUserDashboardSummary() {
  return apiRequest<ApiSummaryResponse & {
    totalLoans?: number;
    totalLoanPrincipalMinor?: string | number;
    totalLoanRepaidMinor?: string | number;
    totalLoanDueMinor?: string | number;
    totalExpenseMinor?: string | number;
  }>('/user/dashboard/summary');
}

export async function getUserCategories(params: { active?: boolean; categoryType?: number } = {}) {
  const query = createQueryString(params);
  const data = await apiRequest<ApiRowsResponse<ApiCategoryRow>>(`/user/categories${query}`);
  return data.rows;
}

export async function getUserTransactions(params: {
  limit?: number;
  offset?: number;
  status?: number;
  txType?: string;
  fromDate?: string;
  toDate?: string;
} = {}) {
  const query = createQueryString(params);
  const data = await apiRequest<ApiRowsResponse<ApiTransactionRow>>(`/user/transactions${query}`);
  return data.rows;
}

export async function getUserLoans(params: { status?: number | string; fromDate?: string; toDate?: string } = {}) {
  const query = createQueryString(params);
  const data = await apiRequest<ApiRowsResponse<ApiLoanRow>>(`/user/loans${query}`);
  return data.rows;
}

export async function getUserLoanRepayments(loanId: string | number) {
  const data = await apiRequest<ApiRowsResponse<ApiLoanRepaymentRow>>(`/user/loans/${loanId}/repayments`);
  return data.rows;
}

export async function getUserExpenses(params: { limit?: number; offset?: number } = {}) {
  const query = createQueryString(params);
  const data = await apiRequest<ApiRowsResponse<ApiTransactionRow>>(`/user/expenses${query}`);
  return data.rows;
}

export async function getUserCommentThreads() {
  const data = await apiRequest<ApiRowsResponse<ApiCommentThreadRow>>('/user/comments/threads');
  return data.rows;
}

export async function createUserCommentThread(subject: string) {
  const data = await apiRequest<ApiRowResponse<ApiCommentThreadRow>>('/user/comments/threads', {
    method: 'POST',
    body: JSON.stringify({ subject }),
  });

  return data.row;
}

export async function getUserCommentMessages(threadId: string | number) {
  const data = await apiRequest<ApiRowsResponse<ApiCommentMessageRow>>(`/user/comments/threads/${threadId}/messages`);
  return data.rows;
}

export async function sendUserCommentMessage(threadId: string | number, messageBody: string) {
  const data = await apiRequest<ApiRowResponse<{ id: string | number }>>(`/user/comments/threads/${threadId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ messageBody }),
  });

  return data.row;
}

export async function getUserProfile() {
  const data = await apiRequest<{ user: ApiAuthUser }>('/user/profile');
  return data.user;
}

export async function updateUserProfile(input: UpdateProfileInput) {
  const data = await apiRequest<{ user: ApiAuthUser }>('/user/profile', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });

  return data.user;
}

export async function getUserNotifications(params: { unread?: boolean; limit?: number } = {}) {
  const query = createQueryString(params);
  const data = await apiRequest<ApiRowsResponse<ApiNotificationRow>>(`/user/notifications${query}`);
  return data.rows;
}

export async function markNotificationRead(notificationId: string | number) {
  const data = await apiRequest<ApiRowResponse<ApiNotificationRow>>(`/user/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });

  return data.row;
}
