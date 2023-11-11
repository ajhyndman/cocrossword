import { isCorrect, printBinaryFile } from '@ajhyndman/puz';
import { Link, useOutletContext } from '@remix-run/react';

import { useSelectionStore } from '~/store/local/selection';
import { useStore } from '~/store/remote';
import BottomAppBar from './BottomAppBar';
import FloatingActionButton from './FloatingActionButton';
import IconButton from './IconButton';
import { useMemo } from 'react';

export default () => {
  const { userId } = useOutletContext<{ userId: string }>();
  const { dispatch, selection } = useSelectionStore();
  const {
    state: { puzzle, readReceipts, messages },
  } = useStore();

  const hasUnreadMessages = useMemo(() => {
    return messages.length > (readReceipts[userId] ?? 0);
  }, [userId, readReceipts[userId], messages.length]);

  const checkSolution = () => {
    if (isCorrect(puzzle!)) {
      window.alert('Congratulations!\n\nYou solved this puzzle.');
    } else {
      window.alert('Nope!\n\nThis puzzle is not yet correct. Please try again');
    }
  };

  // export the current puzzle state as a .puz binary file
  const handleDownload = () => {
    if (puzzle) {
      const buffer = printBinaryFile(puzzle);
      const file = new File([buffer], 'download.puz');
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.download = file.name;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleRotateSelectionClick = () => {
    // if element is already selected, "focus" event won't be triggered
    dispatch({ type: 'ROTATE_SELECTION' });
  };

  const showInfo = () => {
    if (puzzle) {
      window.alert(`${puzzle.title}\n\n${puzzle.author}\n${puzzle.copyright}`);
    }
  };

  return (
    <BottomAppBar
      left={
        <>
          <Link relative="path" to="../chat">
            <IconButton name="chat" notify={hasUnreadMessages} />
          </Link>
          <IconButton name="info" onClick={showInfo} />
          <IconButton name="check_box" onClick={checkSolution} />
          <IconButton name="download" onClick={handleDownload} />
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
