import { useOutletContext } from '@remix-run/react';
import { useCallback, useMemo, useState } from 'react';

import ChatInput from '~/components/ChatInput';
import ChatMessage from '~/components/ChatMessage';
import IconButton from '~/components/IconButton';
import TopAppBar from '~/components/TopAppBar';
import { useStore } from '~/store/remote';

import styles from './$id.chat.module.css';

export default () => {
  const { userId } = useOutletContext<{ userId: string }>();
  const {
    dispatch,
    state: { users, messages },
  } = useStore();
  const [value, setValue] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

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

  const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    dispatch({ type: 'USER_RENAMED', payload: { id: userId, name: event.target.value } });
    setIsEditing(false);
  }, []);

  if (!user) return null;

  return (
    <>
      <TopAppBar
        left={
          <>
            {isEditing ? (
              <input
                autoFocus
                className={styles.titleInput}
                defaultValue={user.name}
                onBlur={handleBlur}
                maxLength={50}
              />
            ) : (
              <span className={styles.title}>{user.name}</span>
            )}
            {!isEditing && <IconButton name="edit" onClick={() => setIsEditing(true)} />}
          </>
        }
        right={
          <>
            <IconButton name="group" />
          </>
        }
      />
      <div className={styles.container}>
        {messages.map((message, i) => {
          const user = users[message.author];
          return (
            <ChatMessage key={i} color={user.color} author={user.name} message={message.body} />
          );
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
    </>
  );
};

// export default () => {
//   const { id } = useParams();

//   return (
//     <Provider KEY={id!}>
//       <View />
//     </Provider>
//   );
// };
