/**
 * Root for desktop version of the site
 */
import { LoaderFunctionArgs, redirect } from '@remix-run/node';
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
  if (!getState().puzzle) return redirect('/');

  return login(request, params.id!);
}

export default function View() {
  const { id } = useParams();
  const { userId, zoom } = useLoaderData<typeof loader>();

  return (
    <Provider KEY={id!}>
      <Outlet context={{ userId, zoom }} />
    </Provider>
  );
}
