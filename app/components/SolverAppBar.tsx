import { Link } from '@remix-run/react';

import { useSelectionStore } from '~/store/selection';
import BottomAppBar from './BottomAppBar';
import FloatingActionButton from './FloatingActionButton';
import IconButton from './IconButton';
import { usePuzzleStore } from '~/store/puzzle';
import { isCorrect } from '@ajhyndman/puz';

export default () => {
  const { dispatch, selection } = useSelectionStore();
  const { puzzle } = usePuzzleStore();

  const checkSolution = () => {
    if (isCorrect(puzzle!)) {
      window.alert('Congratulations!\n\nYou solved this puzzle.');
    } else {
      window.alert('Nope!\n\nThis puzzle is not yet correct. Please try again');
    }
  };

  const handleRotateSelectionClick = () => {
    // if element is already selected, "focus" event won't be triggered
    dispatch({ type: 'ROTATE_SELECTION' });
  };

  return (
    <BottomAppBar
      left={
        <>
          <Link relative="path" to="../chat">
            <IconButton name="chat" />
          </Link>
          <IconButton name="check_box" onClick={checkSolution} />
          {/* <IconButton name="info" /> */}
          {/* <IconButton name="edit" /> */}
        </>
      }
      right={
        <FloatingActionButton
          name={selection.direction === 'row' ? 'text_rotate_vertical' : 'text_rotation_none'}
          onClick={handleRotateSelectionClick}
        />
      }
    />
  );
};
