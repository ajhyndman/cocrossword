import * as development from './index.development';
import * as production from './index.production';

export const dispatch =
  process.env.NODE_ENV === 'production' ? production.dispatch : development.dispatch;

export const getMessageLog =
  process.env.NODE_ENV === 'production' ? production.getMessageLog : development.getMessageLog;
