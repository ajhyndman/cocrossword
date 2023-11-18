import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Outlet, useLoaderData, useMatches, useParams } from '@remix-run/react';
import { type RefObject, useRef, useState, useEffect } from 'react';

import NavigationTabs from '~/components/NavigationTabs';
import { Provider, loadStore } from '~/store/remote';
import { login } from '~/util/login.server';
import styles from './$id.module.css';

export type OutletContext = {
  bottomSheet: RefObject<HTMLDivElement>;
  userId: string;
};

const IOS = typeof document !== 'undefined' && /(iPad|iPhone|iPod)/g.test(navigator.userAgent);

export async function loader({ params, request }: LoaderFunctionArgs) {
  // if no ID passed, redirect to home
  if (!params.id) return redirect('/');

  // if puzzle hasn't been initialized, redirect to home
  const { getState } = await loadStore(params.id);
  if (!getState().puzzle) return redirect('/');

  return login(request, params.id!);
}

export default function View() {
  const matches = useMatches();
  const { id } = useParams();
  const bottomSheet = useRef<HTMLDivElement>(null);
  const [bottomSheetOffset, setBottomSheetOffset] = useState<number>();
  const { userId } = useLoaderData<typeof loader>();

  // **WORKAROUND**
  // iOS does not yet support the meta viewport interactive-widget configuration options.
  // https://github.com/bramus/viewport-resize-behavior/blob/main/explainer.md#the-visual-viewport
  useEffect(() => {
    function fixBottomSheetPosition() {
      window.requestAnimationFrame(() =>
        setBottomSheetOffset(
          document.documentElement.clientHeight -
            (window.visualViewport?.offsetTop ?? 0) -
            (window.visualViewport?.height ?? 0),
        ),
      );
    }

    console.log(matches);

    const isPuzzle = matches.some((match) => match.id === 'routes/$id.puzzle');

    if (IOS && isPuzzle) {
      window.visualViewport?.addEventListener('resize', fixBottomSheetPosition);
      window.visualViewport?.addEventListener('scroll', fixBottomSheetPosition);
      return () => {
        window.visualViewport?.removeEventListener('resize', fixBottomSheetPosition);
        window.visualViewport?.removeEventListener('scroll', fixBottomSheetPosition);

        // reset bottom sheet position
        setBottomSheetOffset(0);
      };
    }
  }, [matches]);

  return (
    <Provider KEY={id!}>
      <div className={styles.container}>
        <Outlet context={{ userId, bottomSheet }} />
        <div
          className={styles.bottomSheet}
          style={bottomSheetOffset ? { bottom: bottomSheetOffset } : {}}
        >
          <div className={styles.bottomSheetPortal} ref={bottomSheet} />
          <NavigationTabs userId={userId} id={id!} />
        </div>
        <div className={styles.fixed} />
      </div>
    </Provider>
  );
}
