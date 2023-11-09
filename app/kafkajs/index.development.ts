import { Log } from './log';
import type { Message } from 'kafkajs';

let log: Log<Message>;

export async function dispatch(key: string, action: any) {
  const log = await getMessageLog();
  log.push({ key, value: JSON.stringify(action) });
}

export async function getMessageLog() {
  if (!log) {
    log = new Log();
  }

  return log;
}
