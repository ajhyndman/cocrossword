import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Outlet, useLoaderData, useParams } from '@remix-run/react';
import { useEffect, useState } from 'react';

import { Provider, loadStore } from '~/store/remote';
import { login } from '~/util/login.server';
import styles from './$id.module.css';
import NavigationTabs from '~/components/NavigationTabs';

export async function loader({ params, request }: LoaderFunctionArgs) {
  // if no ID passed, redirect to home
  if (!params.id) return redirect('/');

  // if puzzle hasn't been initialized, redirect to home
  const { getState } = await loadStore(params.id);
  if (!getState().puzzle) return redirect('/');

  return login(request, params.id!);
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
