import { ChangeEvent } from 'react';

import styles from './ChatInput.module.css';

type Props = {
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  value?: string;
};

export default function ChatInput({ onChange, placeholder, value }: Props) {
  return (
    <textarea
      autoCapitalize="false"
      autoFocus
      // @ts-expect-error enterykeyhint missing in typedefs
      enterKeyHint="send"
      role="textbox"
      rows={1}
      className={styles.input}
      onChange={onChange}
      value={value}
      placeholder={placeholder}
    />
  );
}
