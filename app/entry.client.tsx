import { loadServiceWorker } from '@remix-pwa/sw';
import { RemixBrowser } from '@remix-run/react';
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';

startTransition(() => {
  hydrateRoot(
    document,
    // @ts-expect-error ignore type mismatch between third party deps
    <StrictMode>
      <RemixBrowser />
    </StrictMode>,
  );
});

loadServiceWorker();
