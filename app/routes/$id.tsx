import { LoaderFunctionArgs, MetaArgs, json, redirect } from '@remix-run/node';
import { Outlet, useLoaderData, useMatches, useParams } from '@remix-run/react';
import classNames from 'classnames';
import { type RefObject, useRef, useLayoutEffect } from 'react';

import NavigationTabs from '~/components/NavigationTabs';
import { Provider } from '~/store/isomorphic';
import { loadStore } from '~/store/isomorphic/index.server';
import { login } from '~/util/login.server';
import { siteMeta } from '~/util/siteMeta';
import styles from './$id.module.css';

export type OutletContext = {
  id: string;
  bottomSheet: RefObject<HTMLDivElement>;
  userId: string;
  zoom: number;
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  // if no ID passed, redirect to home
  if (!params.id) return redirect('/');

  const userAgent = request.headers.get('User-Agent')!;
  const isMobile = /(iPad|iPhone|iPod|Android)/i.test(userAgent);
  if (!isMobile) return redirect(`/d/${params.id}`);

  // if puzzle hasn't been initialized, redirect to home
  const { getState } = await loadStore(params.id);
  const state = getState();
  if (!state.puzzle) return redirect('/');

  const { userId, zoom, headers } = await login(request, params.id!);
  return json({ userId, zoom, title: state.puzzle?.title }, { headers });
}

export function meta({ data, params }: MetaArgs<typeof loader>) {
  return siteMeta(`${data?.title} — co-crossword`, params.id);
}

export default function View() {
  const matches = useMatches();
  const { id } = useParams();
  const container = useRef<HTMLDivElement>(null);
  const bottomSheet = useRef<HTMLDivElement>(null);
  const { userId, zoom } = useLoaderData<typeof loader>();

  const isPuzzle = matches.some((match) => match.id === 'routes/$id._index');

  function fixContainerHeight() {
    window.requestAnimationFrame(() => {
      const viewportHeight = window.visualViewport?.height;
      container.current!.style.height = viewportHeight + 'px';
    });
  }

  // **WORKAROUND**
  // iOS does not yet support the meta viewport interactive-widget configuration options.
  // https://github.com/bramus/viewport-resize-behavior/blob/main/explainer.md#the-visual-viewport
  useLayoutEffect(() => {
    const isIos =
      typeof document !== 'undefined' && /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
    if (isIos && isPuzzle) {
      fixContainerHeight();
      window.visualViewport?.addEventListener('resize', fixContainerHeight);
      return () => {
        // clean up height overrides
        // eslint-disable-next-line react-hooks/exhaustive-deps
        container.current!.style.height = 'auto';

        window.visualViewport?.removeEventListener('resize', fixContainerHeight);
      };
    }
  }, [isPuzzle, matches]);

  return (
    <Provider KEY={id!}>
      {zoom && <style>{`html { font-size: ${zoom}% }`}</style>}
      <div
        className={classNames(styles.container, { [styles.isPuzzle]: isPuzzle })}
        ref={container}
      >
        <Outlet context={{ id, userId, bottomSheet, zoom }} />
        <div className={styles.bottomSheet}>
          <div className={styles.bottomSheetPortal} ref={bottomSheet} />
          <NavigationTabs id={id!} userId={userId} />
        </div>
        <div className={styles.fixed} />
      </div>
    </Provider>
  );
}
