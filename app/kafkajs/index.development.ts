import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import type { Message } from 'kafkajs';

import { Log } from './log';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// persist log messages locally in development
const TEMP_DIR = path.join(__dirname, '__temp__');
const LOG_FILE = path.join(TEMP_DIR, 'log');

let log: Log<Message>;

export async function dispatch(key: string, action: any) {
  const log = await getMessageLog();
  const message = { key, value: JSON.stringify(action) };

  log.push(message);
  await fs.appendFile(LOG_FILE, JSON.stringify(message) + '\n');
}

export async function getMessageLog() {
  if (!log) {
    try {
      await fs.mkdir(TEMP_DIR);
    } catch {
      // pass
    }
    const buffer = await fs.readFile(LOG_FILE, { flag: 'a+' });
    const text = buffer.toString();
    const messages = text
      .split('\n')
      .filter((line) => line !== '')
      .map((json) => JSON.parse(json));

    log = new Log(messages);
  }

  return log;
}
