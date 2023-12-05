import { json } from '@remix-run/node';

import { THEME_COLOR } from '~/util/constants';

export const loader = async () => {
  return json(
    {
      short_name: 'co-crossword',
      name: 'co-crossword',
      start_url: '/',
      display: 'standalone',
      background_color: '#FFF',
      theme_color: THEME_COLOR,
      icons: [
        {
          src: '/icons/36logo.png',
          sizes: '36x36',
          type: 'image/png',
          density: '0.75',
        },
        {
          src: '/icons/48logo.png',
          sizes: '48x48',
          type: 'image/png',
          density: '1.0',
        },
        {
          src: '/icons/72logo.png',
          sizes: '72x72',
          type: 'image/png',
          density: '1.5',
        },
        {
          src: '/icons/96logo.png',
          sizes: '96x96',
          type: 'image/png',
          density: '2.0',
        },
        {
          src: '/icons/144logo.png',
          sizes: '144x144',
          type: 'image/png',
          density: '3.0',
        },
        {
          src: '/icons/192logo.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icons/256logo.png',
          sizes: '256x256',
          type: 'image/png',
        },
      ],
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=600',
        'Content-Type': 'application/manifest+json',
      },
    },
  );
};
