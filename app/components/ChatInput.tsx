import { ChangeEvent } from 'react';

import styles from './ChatInput.module.css';

type Props = {
  onChange: (event: ChangeEvent) => void;
  value: string;
};

export default ({ onChange, value }: Props) => {
  return (
    <textarea
      rows={1}
      className={styles.input}
      onChange={onChange}
      value={value}
      placeholder={`Message as Chic Trout`}
    />
  );
};
