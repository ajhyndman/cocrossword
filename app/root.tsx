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

function initHeapAnalytics(trackingId: string) {
  return `window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var r=document.createElement("script");r.type="text/javascript",r.async=!0,r.src="https://cdn.heapanalytics.com/js/heap-"+e+".js";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(r,a);for(var n=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","resetIdentity","removeEventProperty","setEventProperties","track","unsetEventProperty"],o=0;o<p.length;o++)heap[p[o]]=n(p[o])};
  heap.load("${trackingId}");`;
}

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
  { rel: 'manifest', href: '/manifest.webmanifest' },
];

export function loader({ request }: LoaderFunctionArgs) {
  const userAgent = request.headers.get('User-Agent')!;
  const isIos = /(iPad|iPhone|iPod)/g.test(userAgent);

  if (!process.env.HEAP_ANALYTICS_ID) {
    throw new Error('Whoops, you need to configure Heap Analytics!  Please check your .env file.');
  }

  return json({ HEAP_ANALYTICS_ID: process.env.HEAP_ANALYTICS_ID, isIos });
}

export function meta() {
  return siteMeta('co-crossword');
}

export default function App() {
  useSWEffect();

  const { HEAP_ANALYTICS_ID, isIos } = useLoaderData<typeof loader>();

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
        <script
          dangerouslySetInnerHTML={{ __html: initHeapAnalytics(HEAP_ANALYTICS_ID) }}
          type="text/javascript"
        />
        <LiveReload />
        <LiveReloadPwa />
      </body>
    </html>
  );
}
