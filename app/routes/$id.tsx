import { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useLoaderData, useParams } from '@remix-run/react';

import { Provider } from '~/store/remote';
import { login } from '~/util/login.server';
import styles from './$id.module.css';
import { useEffect, useState } from 'react';
import NavigationTabs from '~/components/NavigationTabs';

export async function loader({ request, params: { id } }: LoaderFunctionArgs) {
  const cookie = request.headers.get('Cookie');
  return login(cookie, id!);
}

export default () => {
  const { id } = useParams();
  const { userId } = useLoaderData<typeof loader>();
  const [height, setHeight] = useState<number>();

  // **WORKAROUND**
  // iOS does not yet support the meta viewport interactive-widget configuration options.
  // https://github.com/bramus/viewport-resize-behavior/blob/main/explainer.md#the-visual-viewport
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
    if (iOS) {
      const handleViewportResize = () => {
        setHeight(window.visualViewport?.height);
      };
      window.visualViewport?.addEventListener('resize', handleViewportResize);
      return () => window.visualViewport?.removeEventListener('resize', handleViewportResize);
    }
  }, []);

  return (
    <Provider KEY={id!}>
      <div className={styles.container} style={{ ...(height && { height }) }}>
        <Outlet context={{ userId }} />
        <div className={styles.sticky}>
          <NavigationTabs userId={userId} id={id!} />
        </div>
        <div className={styles.fixed} />
      </div>
    </Provider>
  );
};
