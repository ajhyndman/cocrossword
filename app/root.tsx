import { useSWEffect, LiveReload as LiveReloadPwa } from '@remix-pwa/sw';
import { cssBundleHref } from '@remix-run/css-bundle';
import { LoaderFunctionArgs, json } from '@remix-run/node';
import { Links, LiveReload, Meta, Outlet, Scripts, useLoaderData } from '@remix-run/react';
import classNames from 'classnames';
import { useEffect } from 'react';
import resetCss from 'reset-css/reset.css';

import { siteMeta } from '~/util/siteMeta';
import favicon from '~/favicon.png';
import styles from '~/style.css';

export const links = () => [
  { rel: 'icon', href: favicon },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com' },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Architects+Daughter&display=swap',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/icon?family=Material+Icons',
  },
  { rel: 'stylesheet', href: resetCss },
  { rel: 'stylesheet', href: cssBundleHref! },
  { rel: 'stylesheet', href: styles },
];

export function loader({ request }: LoaderFunctionArgs) {
  const userAgent = request.headers.get('User-Agent')!;
  const isIos = /(iPad|iPhone|iPod)/g.test(userAgent);
  return json({ isIos });
}

export function meta() {
  return siteMeta('co-crossword');
}

export default function App() {
  useSWEffect();

  const { isIos } = useLoaderData<typeof loader>();

  useEffect(() => {
    // disable pinch zoom on iOS devices
    document?.addEventListener(
      'touchmove',
      (event) => {
        if ('scale' in event && event.scale !== 1) {
          event.preventDefault();
        }
      },
      { passive: false },
    );
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no, interactive-widget=resizes-content"
        />
        <Meta />
        <Links />
      </head>
      <body className={classNames({ ios: isIos })}>
        <Outlet />

        <Scripts />
        <LiveReload />
        <LiveReloadPwa />
      </body>
    </html>
  );
}
