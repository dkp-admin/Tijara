import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { apiInstance } from '@/src/api/instance';
import type { OTPResponse, SendOTPRequest, VerifyOTPRequest } from './auth.api-types';
import { AxiosError } from 'axios';

export function useSendOTP(options?: UseMutationOptions<OTPResponse, AxiosError, SendOTPRequest>) {
  return useMutation<OTPResponse, AxiosError, SendOTPRequest>({
    mutationKey: ['auth', 'send-otp'],
    mutationFn: (payload) =>
      apiInstance.post('/ordering/send-otp', payload).then((res) => res.data),
    ...options,
  });
}

export function useVerifyOTP(
  options?: UseMutationOptions<OTPResponse, AxiosError, VerifyOTPRequest>,
) {
  return useMutation<OTPResponse, AxiosError, VerifyOTPRequest>({
    mutationKey: ['auth', 'verify-otp'],
    mutationFn: (payload) =>
      apiInstance.post('/ordering/verify-otp', payload).then((res) => res.data),
    ...options,
  });
}
