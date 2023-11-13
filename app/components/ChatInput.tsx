import { ChangeEvent, FocusEvent } from 'react';

import styles from './ChatInput.module.css';

type Props = {
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus: (event: FocusEvent) => void;
  placeholder: string;
  value?: string;
};

export default ({ onChange, onFocus, placeholder, value }: Props) => {
  return (
    <textarea
      autoCapitalize="false"
      autoFocus
      role="textbox"
      rows={1}
      className={styles.input}
      onChange={onChange}
      onFocus={onFocus}
      value={value}
      placeholder={placeholder}
    />
  );
};
