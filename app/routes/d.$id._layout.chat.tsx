import AppInfo from '~/components/AppInfo';
import Chat from '~/components/Chat';
import Participants from '~/components/Participants';
import Title from '~/components/Title';
import styles from './d.$id._layout.chat.module.css';

export default function View() {
  return (
    <div className={styles.container}>
      <div className={styles.chat}>
        <Chat />
      </div>
      <div className={styles.sidebar}>
        <section className={styles.section}>
          <Title tag="h3">PARTICIPANTS</Title>
          <Participants />
        </section>
        <section className={styles.section}>
          <Title tag="h3">KEYBOARD SHORTCUTS</Title>
          <div className={styles.info}>
            <AppInfo />
          </div>
        </section>
      </div>
    </div>
  );
}
