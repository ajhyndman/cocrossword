import { useFetcher } from '@remix-run/react';
import { useCallback } from 'react';

export const useKafkaAction = (resource: string) => {
  const fetcher = useFetcher();

  const dispatch = useCallback(
    ({ type, payload }: { type: string; payload: any }) => {
      fetcher.submit(
        { type, payload: JSON.stringify(payload) },
        { method: 'POST', action: resource },
      );
    },
    [fetcher],
  );

  return dispatch;
};
