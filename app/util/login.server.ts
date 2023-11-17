import isbot from 'isbot';
import { UAParser } from 'ua-parser-js';
import { v4 } from 'uuid';
import { json } from '@remix-run/node';

import { commitSession, getSession } from '~/sessions.server';
import { DeviceType } from '~/store/remote/users';
import { loadStore } from '~/store/remote';
import { randomItem } from './randomItem';
import { MIDDLE_EARTH_NAMES } from './constants';

export async function login(request: Request, id: string) {
  const userAgent = request.headers.get('User-Agent') ?? '';

  // if this is a bot request, do not assign a session
  if (isbot(userAgent)) {
    return {};
  }

  // if there is a real puzzle, return session
  const cookie = request.headers.get('Cookie');
  const session = await getSession(cookie);

  let userId = session.get('userId');
  let headers = {};

  // if session not yet populated, initialize user
  if (!userId) {
    userId = v4();
    session.set('userId', userId);
    headers = { 'Set-Cookie': await commitSession(session) };
  }

  const { dispatch, getState } = await loadStore(id);
  const user = getState().users[userId];

  // generate a new user if none exists
  if (!user) {
    // generate a placeholder name
    const name = randomItem(MIDDLE_EARTH_NAMES);

    const parser = new UAParser(userAgent);
    const deviceType = (parser.getDevice().type ?? 'desktop') as DeviceType;

    dispatch({ type: 'USER_JOINED', payload: { id: userId, name, deviceType } });
  }

  return json({ userId }, { headers });
}
