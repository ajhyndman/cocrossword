import { useOutletContext } from '@remix-run/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import ChatInput from '~/components/ChatInput';
import ChatMessage from '~/components/ChatMessage';
import IconButton from '~/components/IconButton';
import { useStore } from '~/store/remote';
import styles from './$id.chat.module.css';

export default () => {
  const scrollingElement = useRef<HTMLDivElement>(null);

  const { userId } = useOutletContext<{ userId: string }>();
  const {
    dispatch,
    state: { users, messages },
  } = useStore();
  const [value, setValue] = useState<string>('');

  // while page is open, mark latest message as read
  useEffect(() => {
    dispatch({ type: 'READ_MESSAGE', payload: { id: userId, index: messages.length } });
  }, [userId, messages.length]);

  const user = useMemo(() => users[userId], [users, userId]);

  const submitMessage = useCallback(() => {
    if (!value) return;

    // dispatch message
    dispatch({ type: 'NEW_MESSAGE', payload: { author: userId, body: value } });

    // clear input state
    setValue('');
  }, [userId, value]);

  const handleEnter = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();

        submitMessage();
      }
    },
    [submitMessage],
  );

  // on load, scroll chat window to bottom
  useEffect(() => {
    scrollingElement.current?.scroll({ top: scrollingElement.current?.scrollHeight });
  }, []);

  if (!user) return null;

  return (
    <div className={styles.container} ref={scrollingElement}>
      {messages.map((message, i) => {
        const user = users[message.author];
        return <ChatMessage key={i} color={user.color} author={user.name} message={message.body} />;
      })}
      <div className={styles.anchor} />

      <div className={styles.fixed}>
        <div className={styles.appBar} onKeyDown={handleEnter}>
          <ChatInput
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Message as ${user.name}`}
          />
          <IconButton name="send" onClick={submitMessage} />
        </div>
      </div>
    </div>
  );
};
