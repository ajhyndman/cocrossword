import AppInfo from '~/components/AppInfo';
import Chat from '~/components/Chat';
import Participants from '~/components/Participants';
import Title from '~/components/Title';
import githubIcon from '~/mark-github-16.svg';
import kofiIcon from '~/ko-fi.svg';
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
          <Title tag="h3">ABOUT</Title>
          <p>
            View this project on{' '}
            <a
              className={styles.link}
              href="https://github.com/ajhyndman/crossword-app/issues/1"
              target="_blank"
              rel="noreferrer"
            >
              GitHub <img className={styles.icon} src={githubIcon} alt="github icon" />
            </a>
            .
          </p>
          <p>
            If you enjoy this website, please consider{' '}
            <a
              className={styles.link}
              href="https://ko-fi.com/C0C2RO28J"
              target="_blank"
              rel="noreferrer"
            >
              leaving a tip <img className={styles.icon} src={kofiIcon} alt="" />
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
