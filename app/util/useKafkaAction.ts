import { useFetcher } from '@remix-run/react';

export const useKafkaAction = (resource: string) => {
  const fetcher = useFetcher();

  return ({ type, payload }: { type: string; payload: any }) => {
    fetcher.submit(
      { type, payload: JSON.stringify(payload) },
      { method: 'POST', action: resource },
    );
  };
};
