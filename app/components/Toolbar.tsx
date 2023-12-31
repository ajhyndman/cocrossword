import { useExecute, useSelector } from '~/store/isomorphic';
import FloatingActionButton from './FloatingActionButton';
import styles from './Toolbar.module.css';

export default function Toolbar() {
  const { index, isPencil, direction } = useSelector(({ local }) => local);
  const execute = useExecute();

  const checkSolution = () => {
    execute({ type: 'CHECK_PUZZLE' });
  };

  const handleToggleDirection = () => {
    execute({ type: 'ROTATE_SELECTION' });
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
        label=""
        name={direction === 'column' ? 'text_rotation_none' : 'text_rotate_vertical'}
        onClick={handleToggleDirection}
        transparent
      />
      <FloatingActionButton
        label="Toggle pencil mode"
        name={isPencil ? 'edit_off' : 'edit'}
        size="small"
        onClick={handleTogglePencil}
        transparent
      />
      <FloatingActionButton
        label="Star/Unstar square"
        name="star"
        size="small"
        onClick={handleToggleRebus}
        transparent
      />
      <FloatingActionButton
        label="Check puzzle"
        name="check_box"
        size="small"
        onClick={checkSolution}
        transparent
      />
    </div>
  );
}
