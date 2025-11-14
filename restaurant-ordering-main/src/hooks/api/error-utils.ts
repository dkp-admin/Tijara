import { AxiosError } from 'axios';

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export function isApiError(error: unknown): error is AxiosError<ApiError> {
  return error instanceof AxiosError && error.response?.data?.code !== undefined;
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.response?.data.message || error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}

export const defaultErrorHandler = (error: unknown) => {
  console.error(getErrorMessage(error));
  throw error;
};
