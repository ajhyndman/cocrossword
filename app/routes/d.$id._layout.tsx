import { Outlet } from '@remix-run/react';

import PuzzleGrid from '~/components/PuzzleGrid';
import { useSelector } from '~/store/isomorphic';

export default function View() {
  const puzzle = useSelector(({ remote }) => remote.puzzle);

  if (!puzzle) return null;

  return (
    <>
      <PuzzleGrid />
      <Outlet />
    </>
  );
}
