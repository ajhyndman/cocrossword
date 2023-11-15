import { isCorrect, printBinaryFile } from '@ajhyndman/puz';
import { useState } from 'react';

import { useStore } from '~/store/remote';
import FloatingActionButton from './FloatingActionButton';
import styles from './Toolbar.module.css';
import { useSelectionStore } from '~/store/local/selection';

export default () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    dispatch,
    selection: { isPencil },
  } = useSelectionStore();
  const {
    dispatch: dispatchRemote,
    state: { puzzle },
  } = useStore();

  const close = () => {
    // close toolbar _after_ any other event handlers are triggered
    setTimeout(() => setIsExpanded(false), 100);
  };

  const checkSolution = () => {
    dispatchRemote({ type: 'CHECK_PUZZLE' });
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

  const handleTogglePencil = () => {
    dispatch({ type: 'TOGGLE_PENCIL' });
  };

  return (
    <div className={styles.container}>
      <FloatingActionButton
        label="Close"
        onBlur={close}
        onClick={() => setIsExpanded(!isExpanded)}
        name={isExpanded ? 'close' : 'more_horiz'}
        transparent
      />
      {isExpanded && (
        <>
          <FloatingActionButton
            label="Toggle pencil mode"
            name={isPencil ? 'edit_off' : 'edit'}
            size="small"
            onClick={handleTogglePencil}
          />
          <FloatingActionButton
            label="Check puzzle"
            name="check_box"
            size="small"
            onClick={checkSolution}
          />
          <FloatingActionButton
            label="Download puzzle"
            name="download"
            size="small"
            onClick={handleDownload}
          />
        </>
      )}
    </div>
  );
};
