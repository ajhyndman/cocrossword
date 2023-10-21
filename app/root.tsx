import { cssBundleHref } from '@remix-run/css-bundle';
import { Links, LiveReload, Meta, Outlet, Scripts } from '@remix-run/react';
import { Provider } from 'react-redux';
import { createStore } from './store/store';
import { useEffect } from 'react';

const store = createStore();

export const links = () => [{ rel: 'stylesheet', href: cssBundleHref! }];

export default function App() {
  useEffect(() => {
    // disable pinch zoom on iOS devices
    document.addEventListener(
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
