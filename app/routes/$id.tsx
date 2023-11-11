import { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useLoaderData, useParams } from '@remix-run/react';

import { Provider } from '~/store/remote';
import { login } from '~/util/login.server';

export async function loader({ request, params: { id } }: LoaderFunctionArgs) {
  const cookie = request.headers.get('Cookie');
  return login(cookie, id!);
}

export default () => {
  const { id } = useParams();
  const { userId } = useLoaderData<typeof loader>();

  return (
    <Provider KEY={id!}>
      <Outlet context={{ userId }} />
    </Provider>
  );
};
