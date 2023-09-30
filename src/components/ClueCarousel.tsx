import React, { memo } from 'react';
import { useDispatch } from 'react-redux';

import Clue from './Clue';
import styles from './ClueCarousel.module.css';

type Props = {
  content: string;
  index: number;
};

export default memo(({ content, index }: Props) => {
  const dispatch = useDispatch();

  return (
    <div className={styles.appBar}>
      <button
        className={styles.button}
        onClick={() => dispatch({ type: 'PREVIOUS_CLUE' })}
      >
        <span className="material-icons">arrow_left</span>
      </button>
      <div className={styles.center}>
        <Clue isActive content={content} index={index} />
      </div>
      <button
        className={styles.button}
        onClick={() => dispatch({ type: 'NEXT_CLUE' })}
      >
        <span className="material-icons">arrow_right</span>
      </button>
    </div>
  );
});
