import { LoaderFunctionArgs } from '@remix-run/node';
import { addWeeks, differenceInCalendarDays, format, nextDay } from 'date-fns';

const EARLIEST_AVAILABLE_DATE = '1993-11-21';
const LATEST_AVAILABLE_DATE = '2021-08-10';
const ARCHIVE_URL = 'https://archive.org/download/nyt-puz/daily';

// sunday

/// 10125

/**
 * Fetch a nyt puzzle from the archive
 */
export function loader({ params }: LoaderFunctionArgs) {
  if (params.difficulty == null) throw new Error('Missing parameter: "difficulty"');
  const difficulty = Number.parseInt(params.difficulty); // day of the week (sun-sat)

  const firstMatchingDay = nextDay(EARLIEST_AVAILABLE_DATE, difficulty);
  // const lastMatchingDay = previousDay(LATEST_AVAILABLE_DATE, difficulty);
  const availableDays = differenceInCalendarDays(LATEST_AVAILABLE_DATE, firstMatchingDay);
  const availableWeeks = Math.floor(availableDays / 7);

  // pick a random matching day
  const selectedWeek = Math.floor(Math.random() * availableWeeks);
  const date = addWeeks(firstMatchingDay, selectedWeek);

  // console.log(dayOfWeek);

  const url = `${ARCHIVE_URL}/${date.getFullYear()}/${format(date, 'MM')}/${format(
    date,
    'MMMddyy',
  )}.puz`;
  console.log(url);
  return fetch(url);
  // const blob = await response.blob();
  // const file = new File([blob], 'Nov2193.puz');
  // return file;
}
