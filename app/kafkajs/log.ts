type Subscriber<T> = (entry: T) => void;

/**
 * A simple observable list class.
 */
export class Log<T> {
  log: T[];
  subscribers: Set<Subscriber<T>>;

  constructor() {
    this.log = [];
    this.subscribers = new Set();

    this.push.bind(this);
    this.subscribe.bind(this);
    this.getLog.bind(this);
  }

  push(event: T) {
    this.log = this.log.concat([event]);
    this.subscribers.forEach((subscriber) => {
      subscriber(event);
    });
  }

  subscribe(subscriber: Subscriber<T>) {
    // push any existing messages to subscriber before registering
    if (this.log.length > 0) {
      this.log.forEach(subscriber);
    }

    this.subscribers.add(subscriber);

    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  getLog() {
    return this.log;
  }
}
