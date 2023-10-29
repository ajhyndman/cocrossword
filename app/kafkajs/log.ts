import debounce from 'lodash.debounce';

type Subscriber<T> = (entries: T[]) => void;

// broadcast changes 60 no more than 60 times a second
const BROADCAST_INTERVAL = 1000 / 60;

/**
 * A simple observable list class.
 */
export class Log<T> {
  private cursor: number = 0;
  private log: T[] = [];
  private subscribers: Set<Subscriber<T>> = new Set();

  constructor() {
    this.push = this.push.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.getLog = this.getLog.bind(this);
    this.broadcast = debounce(this.broadcast.bind(this), BROADCAST_INTERVAL);
  }

  broadcast() {
    const newMessages = this.log.slice(this.cursor);
    this.cursor = this.log.length;

    this.subscribers.forEach((subscriber) => {
      subscriber(newMessages);
    });
  }

  push(event: T) {
    this.log = this.log.concat([event]);
    this.broadcast();
  }

  subscribe(subscriber: Subscriber<T>) {
    // push any existing messages to subscriber before registering
    const oldMessages = this.log.slice(0, this.cursor);
    subscriber(oldMessages);

    this.subscribers.add(subscriber);

    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  getLog() {
    return this.log;
  }
}
