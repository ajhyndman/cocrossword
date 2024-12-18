import { LoaderFunctionArgs } from '@remix-run/node';
import { addWeeks, differenceInCalendarDays, format, nextDay, type Day } from 'date-fns';

const EARLIEST_AVAILABLE_DATE = '1993-11-21';
const LATEST_AVAILABLE_DATE = '2021-08-10';
const ARCHIVE_BASE_URL = 'https://archive.org/download/nyt-puz/daily';

/**
 * Construct a download URL for a New York Times puzzle file on archive.org
 */
function formatPuzzleUrl(date: Date): string {
  const fullYear = date.getFullYear();
  const month = format(date, 'MM');
  const monthDayYear = format(date, 'MMMddyy');
  return `${ARCHIVE_BASE_URL}/${fullYear}/${month}/${monthDayYear}.puz`;
}

/**
 * Fetch a New York Times crossword puzzle file from archive.org
 */
export function loader({ params }: LoaderFunctionArgs) {
  if (params.difficulty == null) throw new Error('Missing parameter: "difficulty"');
  const difficulty = Number.parseInt(params.difficulty) as Day; // day of the week (sun-sat)

  const firstMatchingDay = nextDay(EARLIEST_AVAILABLE_DATE, difficulty);
  const availableDays = differenceInCalendarDays(LATEST_AVAILABLE_DATE, firstMatchingDay);
  const availableWeeks = Math.floor(availableDays / 7);

  // pick a random matching day
  const selectedWeek = Math.floor(Math.random() * availableWeeks);
  const date = addWeeks(firstMatchingDay, selectedWeek);

  const url = formatPuzzleUrl(date);
  return fetch(url);
}
