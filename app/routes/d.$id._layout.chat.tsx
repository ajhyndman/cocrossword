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
        <section className={styles.section}>
          <Title tag="h3">SUPPORT</Title>
          <p>If you enjoy this website, please consider leaving a tip. </p>
          <p>
            <a href="https://ko-fi.com/C0C2RO28J" target="_blank" rel="noreferrer">
              <img
                height="36"
                style={{ border: 0, height: 36 }}
                src="https://storage.ko-fi.com/cdn/brandasset/kofi_button_stroke.png"
                alt="Buy Me a Coffee at ko-fi.com"
              />
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
