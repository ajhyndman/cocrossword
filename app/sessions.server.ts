import { createCookieSessionStorage } from '@remix-run/node';

type SessionData = {
  userId: string;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } = createCookieSessionStorage<
  SessionData,
  SessionFlashData
>({
  // a Cookie from `createCookie` or the CookieOptions to create one
  cookie: {
    name: '__session',

    // all of these are optional
    httpOnly: true,
    maxAge: 2_629_800, // one month
    sameSite: 'lax',
    secrets: ['piwCJrgsQgKa9knW9bKr'],
    secure: process.env.NODE_ENV === 'production',
  },
});

export { getSession, commitSession, destroySession };
