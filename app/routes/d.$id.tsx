/**
 * Root for desktop version of the site
 */
import { LoaderFunctionArgs, MetaArgs, json, redirect } from '@remix-run/node';
import { Outlet, useLoaderData, useParams } from '@remix-run/react';

import { Provider } from '~/store/isomorphic';
import { loadStore } from '~/store/isomorphic/index.server';
import { login } from '~/util/login.server';

export async function loader({ params, request }: LoaderFunctionArgs) {
  // if no ID passed, redirect to home
  if (!params.id) return redirect('/');

  const userAgent = request.headers.get('User-Agent')!;
  const isMobile = /(iPad|iPhone|iPod|Android)/i.test(userAgent);
  if (isMobile) return redirect(`/${params.id}/puzzle`);

  // if puzzle hasn't been initialized, redirect to home
  const { getState } = await loadStore(params.id);
  const state = getState();
  if (!state.puzzle) return redirect('/');

  const { userId, zoom, headers } = await login(request, params.id!);
  return json({ userId, zoom, title: state.puzzle?.title }, { headers });
}

export function meta({ data }: MetaArgs<typeof loader>) {
  return [{ title: `co-crossword — ${data?.title}` }];
}

export default function View() {
  const { id } = useParams();
  const { userId, zoom } = useLoaderData<typeof loader>();

  return (
    <Provider KEY={id!}>
      <Outlet context={{ id, userId, zoom }} />
    </Provider>
  );
}
