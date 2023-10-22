import { cssBundleHref } from '@remix-run/css-bundle';
import { Links, LiveReload, Meta, Outlet, Scripts } from '@remix-run/react';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import resetCss from 'reset-css/reset.css';

import { createStore } from './store/store';
import styles from './style.css';

const store = createStore();

export const links = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com' },
  { rel: 'stylesheet', href: resetCss },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Architects+Daughter&display=swap',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/icon?family=Material+Icons',
  },
  { rel: 'stylesheet', href: cssBundleHref! },
  { rel: 'stylesheet', href: styles },
];

export default function App() {
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
    <html>
      <head>
        <link rel="icon" href="data:image/x-icon;base64,AA" />
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no, interactive-widget=resizes-content"
        />
        <title>Crossword App</title>
        <Meta />
        <Links />
      </head>
      <body>
        <Provider store={store}>
          <Outlet />
        </Provider>

        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
