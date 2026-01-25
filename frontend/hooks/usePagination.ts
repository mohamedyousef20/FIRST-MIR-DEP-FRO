import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export interface PaginationState {
  page: number;
  limit: number;
}

export function usePagination(defaultLimit = 20): [PaginationState, (page: number) => void, (limit: number) => void] {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || defaultLimit);

  const setPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set('page', String(newPage));
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const setLimit = useCallback(
    (newLimit: number) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set('limit', String(newLimit));
      params.set('page', '1');
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return [{ page, limit }, setPage, setLimit];
}
