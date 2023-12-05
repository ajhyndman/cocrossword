import preview from '~/preview.png';
import { SITE_DESCRIPTION } from './constants';

export function siteMeta(title: string, id: string = '') {
  return [
    { title },
    { name: 'description', content: SITE_DESCRIPTION },
    { property: 'og:title', content: title },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: `https://cocrossword.com/${id}` },
    { property: 'og:site_name', content: 'co-crossword' },
    { property: 'og:image', content: preview },
    { property: 'og:image:type', content: 'image/png' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '1200' },
    {
      property: 'og:image:alt',
      content: 'A screenshot of a crossword puzzle, filled with intersecting words and hints.',
    },
  ];
}
