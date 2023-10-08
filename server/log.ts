/**
 * A simple observable list class.
 */
export class Log<T> {
  log: T[];
  subscribers: Function[];

  constructor() {
    this.log = [];
    this.subscribers = [];

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

  subscribe(subscriber: Function) {
    // push any existing messages to subscriber before registering
    if (this.log.length > 0) {
      this.log.forEach(subscriber);
    }

    this.subscribers.push(subscriber);
  }

  getLog() {
    return this.log;
  }
}
