import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { defaultErrorHandler } from './error-utils';
import { apiInstance } from '@/src/api/instance';

interface UseGetOptions<TData, TError, TTransformed>
  extends Omit<UseQueryOptions<TData, TError, TTransformed>, 'queryKey' | 'queryFn'> {
  params?: Record<string, unknown>;
}

function getLocationFromUrl() {
  try {
    const url = window.location.href;

    const urlObj = new URL(url);

    const hostParts = urlObj.hostname.split('.');

    if (hostParts.length >= 3 && hostParts[0] === 'dev') {
      return hostParts[1];
    } else if (hostParts.length >= 2) {
      return hostParts[0];
    }

    return null;
  } catch (error) {
    console.error('Invalid URL:', error);
    return null;
  }
}

export function useGet<TData = unknown, TError = AxiosError, TTransformed = TData>(
  url: string,
  queryKey: readonly unknown[],
  options?: UseGetOptions<TData, TError, TTransformed>,
) {
  const { params = {}, ...queryOptions } = options || {};

  const finalQuery = url + `&hostname=${getLocationFromUrl()}`;

  return useQuery<TData, TError, TTransformed>({
    queryKey,
    queryFn: async () => {
      try {
        const { data } = await apiInstance.get<TData>(finalQuery, { params });
        return data;
      } catch (error) {
        defaultErrorHandler(error);
        throw error;
      }
    },
    ...queryOptions,
  });
}
