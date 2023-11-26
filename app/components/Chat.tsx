import { useOutletContext } from '@remix-run/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import ChatInput from '~/components/ChatInput';
import ChatMessage from '~/components/ChatMessage';
import IconButton from '~/components/IconButton';
import { useExecute, useSelector } from '~/store/isomorphic';
import { OutletContext } from '~/routes/$id';
import styles from './Chat.module.css';

export default function Chat() {
  const { userId } = useOutletContext<OutletContext>();
  const users = useSelector(({ remote }) => remote.users);
  const messages = useSelector(({ remote }) => remote.messages);
  const execute = useExecute();
  const [value, setValue] = useState<string>('');

  const submitMessage = useCallback(() => {
    if (!value) return;

    // execute message
    execute({
      type: 'NEW_MESSAGE',
      payload: { author: userId, body: value, timestamp: Date.now() },
    });

    // clear input state
    setValue('');
  }, [execute, userId, value]);

  // while page is open, mark latest message as read
  useEffect(() => {
    execute({ type: 'READ_MESSAGE', payload: { id: userId, index: messages.length } });
  }, [execute, userId, messages.length]);

  const user = useMemo(() => users[userId], [users, userId]);
  const handleEnter = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();

        submitMessage();
      }
    },
    [submitMessage],
  );

  return (
    <>
      <div className={styles.container}>
        {messages.map((message, i) => {
          const user = users[message.author];
          return (
            <ChatMessage
              key={i}
              color={user.color}
              author={user.name}
              message={message.body}
              timestamp={message.timestamp}
            />
          );
        })}
        <div className={styles.anchor} />
      </div>
      <div className={styles.appBar} onKeyDown={handleEnter}>
        <ChatInput
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`Message as ${user.name}`}
        />
        <IconButton name="send" onClick={submitMessage} />
      </div>
    </>
  );
}
