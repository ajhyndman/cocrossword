import React from 'react';

import styles from './Test.module.css';
import Clue from '../components/Clue';

export default () => (
  <ol className={styles.clues}>
    <Clue
      index={1}
      content="“The sentinels silent and sure,” per a “Les Miserables” song"
    />
    <Clue
      isActive
      index={2}
      content="“The sentinels silent and sure,” per a “Les Miserables” song"
    />
    <Clue
      index={3}
      content="“The sentinels silent and sure,” per a “Les Miserables” song"
    />
  </ol>
);
