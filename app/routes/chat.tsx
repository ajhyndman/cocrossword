import ChatMessage from '~/components/ChatMessage';
import ChatInput from '~/components/ChatInput';
import IconButton from '~/components/IconButton';

import styles from './chat.module.css';

const CHAT_COLORS = [
  // list of colors that may be assigned to a user
  '#405695',
  '#409395',
  '#509540',
  '#714095',
  '#954058',
  '#95408E',
  '#957840',
  '#BB51B3',
];

export default () => {
  return (
    <div className={styles.container}>
      <ChatMessage
        color={CHAT_COLORS[0]}
        author="Notable Mole"
        message="Could 36A be “Elephant”?"
      />
      <ChatMessage color={CHAT_COLORS[0]} author="Disdainful Heron" message="Hello!" />
      <ChatMessage color={CHAT_COLORS[1]} author="Disdainful Heron" message="Hello!" />
      <ChatMessage color={CHAT_COLORS[2]} author="Disdainful Heron" message="Hello!" />
      <ChatMessage color={CHAT_COLORS[3]} author="Disdainful Heron" message="Hello!" />
      <ChatMessage color={CHAT_COLORS[4]} author="Disdainful Heron" message="Hello!" />
      <ChatMessage color={CHAT_COLORS[5]} author="Disdainful Heron" message="Hello!" />
      <ChatMessage color={CHAT_COLORS[6]} author="Disdainful Heron" message="Hello!" />
      <ChatMessage color={CHAT_COLORS[7]} author="Disdainful Heron" message="Hello!" />
      <ChatMessage
        color={CHAT_COLORS[2]}
        author="Chic Trout"
        message="It looks like the clue for 17A might help with 42D"
      />
      <ChatMessage
        author="Disdainful Heron"
        color={CHAT_COLORS[1]}
        message="The name of this puzzle is “Dynamic Duos”. Could that be a clue to the connection between some of these clues?"
      />

      <div className={styles.sticky}>
        <div className={styles.appBar}>
          <ChatInput />
          <IconButton name="send" />
        </div>
      </div>
      {/* simply having a position: fixed element on the page fixes a bug with
            position: sticky on some browsers.
            @see: https://www.stevefenton.co.uk/blog/2022/12/mobile-position-sticky-issue/ */}
      <div className={styles.fixed} />
    </div>
  );
};
