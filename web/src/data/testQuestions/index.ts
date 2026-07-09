export * from './types';
export * from './easy';
export * from './medium';
export * from './hard';
export * from './exam';

import { easyQuestions } from './easy';
import { mediumQuestions } from './medium';
import { hardQuestions } from './hard';
import { examQuestions } from './exam';

export const testQuestions = {
  easy: easyQuestions,
  medium: mediumQuestions,
  hard: hardQuestions,
  exam: examQuestions
};
