import { apiRequest, createQueryString } from '../client';
import type {
  ApiCategoryRow,
  ApiCommentMessageRow,
  ApiCommentThreadRow,
  ApiLoanRepaymentRow,
  ApiLoanRow,
  ApiNotificationRow,
  ApiQuranProgressRow,
  ApiMyQuranPenaltyResponse,
  ApiQuranWeeklyCompletionResponse,
  ApiRowsResponse,
  ApiSummaryResponse,
  ApiTransactionRow,
  ApiAuthUser,
  CompleteProfileInput,
  UpdateProfileInput,
  ApiRowResponse,
  ApiDataResponse,
  UserExpenseInput,
  LoanRepaymentInput,
  QuranProgressInput,
  UserLoanInput,
  UserTransactionInput,
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

export async function createUserTransaction(input: UserTransactionInput) {
  const data = await apiRequest<ApiRowResponse<ApiTransactionRow>>('/user/transactions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.row;
}

export async function getUserLoans(params: { status?: number | string; fromDate?: string; toDate?: string } = {}) {
  const query = createQueryString(params);
  const data = await apiRequest<ApiRowsResponse<ApiLoanRow>>(`/user/loans${query}`);
  return data.rows;
}

export async function createUserLoan(input: UserLoanInput) {
  const data = await apiRequest<ApiRowResponse<ApiLoanRow>>('/user/loans', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.row;
}

export async function getUserLoanRepayments(loanId: string | number) {
  const data = await apiRequest<ApiRowsResponse<ApiLoanRepaymentRow>>(`/user/loans/${loanId}/repayments`);
  return data.rows;
}

export async function createUserLoanRepayment(loanId: string | number, input: LoanRepaymentInput) {
  const data = await apiRequest<ApiDataResponse<{ loanId: string | number; repaymentTxId: string | number; totalRepaidMinor: number; status: number }>>(`/user/loans/${loanId}/repayments`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.data;
}

export async function getUserExpenses(params: { limit?: number; offset?: number } = {}) {
  const query = createQueryString(params);
  const data = await apiRequest<ApiRowsResponse<ApiTransactionRow>>(`/user/expenses${query}`);
  return data.rows;
}

export async function createUserExpense(input: UserExpenseInput) {
  const data = await apiRequest<ApiRowResponse<ApiTransactionRow>>('/user/expenses', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.row;
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

export async function completeUserProfile(input: CompleteProfileInput) {
  const data = await apiRequest<{ user: ApiAuthUser }>('/user/profile/complete', {
    method: 'POST',
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

export async function savePushSubscription(subscription: PushSubscriptionJSON) {
  const data = await apiRequest<ApiRowResponse<{ id: string | number }>>('/user/push-subscriptions', {
    method: 'POST',
    body: JSON.stringify(subscription),
  });
  return data.row;
}

export async function removePushSubscription(endpoint: string) {
  await apiRequest<void>('/user/push-subscriptions', {
    method: 'DELETE',
    body: JSON.stringify({ endpoint }),
  });
}

export function testDevicePushNotification() {
  return apiRequest<{ data: { enabled: boolean; subscriptions: number; sent: number; failed: number } }>('/user/push-subscriptions/test', {
    method: 'POST',
  });
}

export async function getUserQuranProgress(params: { fromDate?: string; toDate?: string } = {}) {
  const query = createQueryString(params);
  const data = await apiRequest<ApiRowsResponse<ApiQuranProgressRow>>(`/user/quran/progress${query}`);
  return data.rows;
}

export function getMyQuranPenalties() {
  return apiRequest<ApiMyQuranPenaltyResponse>('/user/quran/penalties');
}

export function getInternalQuranWeeklyCompletion() {
  return apiRequest<ApiQuranWeeklyCompletionResponse>('/user/quran/weekly-completion');
}

export async function createUserQuranProgress(input: QuranProgressInput = {}) {
  const data = await apiRequest<ApiRowResponse<ApiQuranProgressRow>>('/user/quran/progress', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.row;
}

export async function updateUserQuranProgress(progressId: string | number, input: QuranProgressInput = {}) {
  const data = await apiRequest<ApiRowResponse<ApiQuranProgressRow>>(`/user/quran/progress/${progressId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return data.row;
}
