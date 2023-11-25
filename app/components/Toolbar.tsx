import { useExecute, useSelector } from '~/store/isomorphic';
import FloatingActionButton from './FloatingActionButton';
import styles from './Toolbar.module.css';

export default function Toolbar() {
  const { index, isPencil, isToolbarExpanded } = useSelector(({ local }) => local);
  const execute = useExecute();

  const checkSolution = () => {
    execute({ type: 'CHECK_PUZZLE' });
  };

  const handleDownload = () => {
    execute({ type: 'DOWNLOAD_PUZZLE' });
  };

  const handleTogglePencil = () => {
    execute({ type: 'TOGGLE_PENCIL' });
  };

  const handleToggleRebus = () => {
    if (index) {
      execute({ type: 'TOGGLE_STARRED', payload: { index } });
    }
  };

  const handleToggleToolbar = () => {
    execute({ type: 'TOGGLE_TOOLBAR' });
  };

  return (
    <div className={styles.container}>
      <FloatingActionButton
        label="Close"
        onClick={handleToggleToolbar}
        name={isToolbarExpanded ? 'close' : 'more_horiz'}
        transparent
      />
      {isToolbarExpanded && (
        <>
          <FloatingActionButton
            label="Toggle pencil mode"
            name={isPencil ? 'edit_off' : 'edit'}
            size="small"
            onClick={handleTogglePencil}
          />
          <FloatingActionButton
            label="Star/Unstar square"
            name="star"
            size="small"
            onClick={handleToggleRebus}
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
}
