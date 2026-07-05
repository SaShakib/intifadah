export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly requestId?: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number, options?: { requestId?: string; details?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.requestId = options?.requestId;
    this.details = options?.details;
  }
}

export function getErrorMessage(error: unknown, fallback = 'একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।'): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
