import { useExecute, useSelector } from '~/store/isomorphic';
import FloatingActionButton from './FloatingActionButton';
import styles from './NavigationRail.module.css';

export default function NavigationRail() {
  const { index, isPencil } = useSelector(({ local }) => local);
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

  return (
    <div className={styles.container}>
      <FloatingActionButton
        label="Toggle pencil mode"
        name={isPencil ? 'edit_off' : 'edit'}
        onClick={handleTogglePencil}
        style="primary"
      />
      <FloatingActionButton
        label="Star/Unstar square"
        name="star"
        onClick={handleToggleRebus}
        size="small"
        style="secondary"
      />
      <FloatingActionButton
        label="Check puzzle"
        name="check_box"
        onClick={checkSolution}
        size="small"
        style="secondary"
      />
      <FloatingActionButton
        label="Download puzzle"
        name="download"
        onClick={handleDownload}
        size="small"
        style="secondary"
      />
    </div>
  );
}
