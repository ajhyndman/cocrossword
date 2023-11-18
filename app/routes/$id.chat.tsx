import { useOutletContext } from '@remix-run/react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import ChatInput from '~/components/ChatInput';
import ChatMessage from '~/components/ChatMessage';
import IconButton from '~/components/IconButton';
import { useStore } from '~/store/remote';
import styles from './$id.chat.module.css';
import type { OutletContext } from './$id';
import { usePrevious } from '~/util/usePrevious';

export default function View() {
  const { bottomSheet, userId } = useOutletContext<OutletContext>();
  const {
    dispatch,
    state: { users, messages },
  } = useStore();
  const [value, setValue] = useState<string>('');

  // while page is open, mark latest message as read
  useEffect(() => {
    dispatch({ type: 'READ_MESSAGE', payload: { id: userId, index: messages.length } });
  }, [dispatch, userId, messages.length]);

  const user = useMemo(() => users[userId], [users, userId]);

  const submitMessage = useCallback(() => {
    if (!value) return;

    // dispatch message
    dispatch({ type: 'NEW_MESSAGE', payload: { author: userId, body: value } });

    // clear input state
    setValue('');
  }, [dispatch, userId, value]);

  const handleEnter = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();

        submitMessage();
      }
    },
    [submitMessage],
  );

  const previousMessageLength = usePrevious(messages.length);

  // on load, scroll chat window to bottom
  useLayoutEffect(() => {
    window.scroll({ top: document.body.scrollHeight });
  }, []);

  useLayoutEffect(() => {
    if (
      // if messages just loaded for the first time, or
      (previousMessageLength === 0 && messages.length !== 0) ||
      // if overflow-anchor not supported
      !CSS.supports('overflow-anchor', 'none')
    ) {
      // programmatically scroll to bottom
      window.scroll({ top: document.body.scrollHeight });
    }
  }, [previousMessageLength, messages.length]);

  if (!user) return null;

  return (
    <div className={styles.container}>
      {messages.map((message, i) => {
        const user = users[message.author];
        return <ChatMessage key={i} color={user.color} author={user.name} message={message.body} />;
      })}
      <div className={styles.anchor} />

      {createPortal(
        // @ts-expect-error third party type mismatch React.Node vs React.Element
        <div className={styles.appBar} onKeyDown={handleEnter}>
          <ChatInput
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Message as ${user.name}`}
          />
          <IconButton name="send" onClick={submitMessage} />
        </div>,
        bottomSheet.current,
      )}
    </div>
  );
}
