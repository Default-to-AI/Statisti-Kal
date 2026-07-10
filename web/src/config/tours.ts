import { type Step } from 'react-joyride';
import type { SitePage } from '../components/SiteHeader';
import type { CalcMode } from '../components/calc-ui';

export type ActivePage = 'landing' | 'hypothesis' | 'point-estimation' | 'normal';
export type TourMode = 'global' | 'hypothesis' | 'inverse' | 'forward' | 'table' | 'formula-sheet' | null;

export interface GuidedTourStep extends Step {
  context?: {
    page: ActivePage;
    normalMode?: CalcMode;
  };
  /** Accordion IDs to open via toc-open-path when entering this step. */
  openPath?: string[];
  /** Element ID to scroll to after the page/accordion settles. */
  scrollToId?: string;
  disableBeacon?: boolean;
  spotlightClicks?: boolean;
}

export const globalTourSteps: GuidedTourStep[] = [
  {
    target: 'body',
    content: 'חישוב אחוזונים. בוחרים כיוון. מזינים את מאפייני ההתפלגות, רואים צעדי חישוב והמחשה על ידי גרף.',
    placement: 'center',
    disableBeacon: true,
    scrollToId: 'normal-distribution-controls',
    context: { page: 'normal', normalMode: 'inverse' },
  },
  {
    target: 'body',
    content: 'חישוב הסתברויות. כאן יש גם הסתברות מצטברת מותנית. מזינים את מאפייני ההתפלגות ורואים את שלבי הפתרון יחד עם ויזואליזציה להמחשה.',
    placement: 'center',
    disableBeacon: true,
    scrollToId: 'normal-distribution-controls',
    context: { page: 'normal', normalMode: 'forward' },
  },
  {
    target: 'body',
    content: 'דף טבלאות התפלגויות מכיל את ההתפלגות הנורמלית הסטנדרטית והתפלגות t. הטבלאות אינטראקטיביות כך שאפשר לחפש הסתברויות ע"י הזנת ערכים או הפוך. הטבלה קופצת ישר לתוצאה שמחפשים ומציגה את זה גם בכתיב מתמטי.',
    placement: 'center',
    disableBeacon: true,
    openPath: ['normal-z-table'],
    scrollToId: 'normal-z-table',
    context: { page: 'normal', normalMode: 'table' },
  },
  {
    target: 'body',
    content: 'דף הנוסחאות מכיל נוסחאות מסטטיסטיקה א\' ומסטטיסטיקה ב\', המחולקים לראשי פרקים. ותוכן עניינים עם קישור מהיר לפרק.',
    placement: 'center',
    disableBeacon: true,
    context: { page: 'normal', normalMode: 'formula-sheet' },
  },
  {
    target: 'body',
    content: 'זהו דף בדיקת ההשערות. מזינים מאפייני אוכלוסייה ומדגם, עוקבים אחרי תהליך הפתרון לכל כיוון מבחן, ובתחתית משלימים את התמונה עם רווח סמך ועוצמת מבחן.',
    placement: 'center',
    disableBeacon: true,
    scrollToId: 'hypothesis-parameters',
    context: { page: 'hypothesis' },
  },
  {
    target: '.tour-quick-nav-toggle',
    content: 'זהו רכיב תוכן העניינים. לחיצה עליו מאפשרת לקפוץ במהירות לכל חלק בדף. לחצו עליו עכשיו.',
    placement: 'left',
    spotlightClicks: true,
    buttons: ['back', 'close'],
    context: { page: 'hypothesis' },
  },
  {
    target: '.tour-first-ci-formula button',
    content: 'זהו כפתור אינפורמציה המופיע ליד נוסחאות. לחצו עליו כדי לראות הסבר מילולי קצר על הנוסחה.',
    placement: 'top',
    spotlightClicks: true,
    context: { page: 'hypothesis' },
  },
  {
    target: '.tour-scroll-top-button',
    content: 'כאשר גוללים למטה, כפתור זה מופיע. לחצו עליו כדי לחזור למעלה ולסיים את החלק הזה!',
    placement: 'right',
    spotlightClicks: true,
    buttons: ['back', 'close'],
    context: { page: 'hypothesis' },
  }
];

export const hypothesisLocalSteps: GuidedTourStep[] = [
  {
    target: '.tour-step-intro',
    content: 'זהו סיור מקומי לדף בדיקת השערות. נעבור על התרחיש, הקלטים, הגרף, ההחלטה וכל שכבות ההעמקה — לפי סדר פתרון אמיתי.',
    disableBeacon: true,
    placement: 'center',
  },
  {
    target: '.tour-step-inputs',
    content: 'זהו אזור הקלט. כאן מגדירים את נתוני האוכלוסייה והמדגם, את רמת המובהקות ואת השערת המחקר. כל שאר הרכיבים מתעדכנים לפי הבחירות כאן.',
    placement: 'right',
  },
  {
    target: '.tour-power-quick-link',
    content: 'קישור מהיר לעוצמת המבחן. הוא פותח את החישוב המלא של Power ומקפיץ בדיוק למקום הרלוונטי.',
    placement: 'bottom',
  },
  {
    target: '.tour-step-graph',
    content: 'הגרף הוא ההמחשה של המבחן: התפלגות הדגימה, אזור הדחייה, אזור אי־הדחייה והערך שהתקבל — כולם מתעדכנים בזמן אמת.',
    placement: 'left',
  },
  {
    target: '.tour-step-graph-toggle',
    content: 'המתג מציג את H₁ ואת אזור עוצמת המבחן על אותו גרף. כך רואים את הקשר בין התפלגות חלופית, β ו־1−β.',
    placement: 'bottom',
  },
  {
    target: '.tour-step-decision',
    content: 'מטריצת ההחלטה מחברת בין החלטת המבחן למציאות: דחייה נכונה, אי־דחייה נכונה, טעות מסוג I וטעות מסוג II.',
    placement: 'top',
  },
  {
    target: '.tour-step-accordion-ht',
    content: 'כאן נמצא פתרון המבחן שלב־אחר־שלב — מניסוח ההשערות ועד מסקנה מילולית שאפשר להגיש.',
    placement: 'top',
    openPath: ['hypothesis-panel'],
    scrollToId: 'hypothesis-panel',
  },
  {
    target: '.tour-step-test-type',
    content: 'בשלב הזה בוחרים את סוג המבחן וכיוונו: שמאלי, ימני או דו־צדדי. הבחירה משנה את הערך הקריטי ואת אזור הדחייה.',
    placement: 'bottom',
    openPath: ['hypothesis-panel', 'step-2'],
    scrollToId: 'step-2',
  },
  {
    target: '.tour-step-accordion-ci',
    content: 'רווח הסמך נותן זווית משלימה להחלטת המבחן: טווח הערכים הסבירים לפרמטר, ברמת הביטחון שבחרתם.',
    placement: 'top',
    scrollToId: 'confidence-panel',
  },
  {
    target: '.tour-first-ci-formula button',
    content: 'ליד נוסחאות מופיע כפתור מידע. הוא פותח ניסוח מילולי קצר שמחבר בין הסימון המתמטי לבין המשמעות שלו.',
    placement: 'top',
    spotlightClicks: true,
    openPath: ['confidence-panel'],
    scrollToId: 'confidence-panel',
  },
  {
    target: '.tour-power-panel',
    content: 'זהו פירוק העוצמה המלא: שגיאת תקן, ערך קריטי, Z תחת H₁ והמשמעות של β מול 1−β. כאן בודקים עד כמה המבחן מסוגל לזהות אפקט אמיתי.',
    placement: 'top',
    scrollToId: 'power-panel',
  }
];

export const inverseLocalSteps: GuidedTourStep[] = [
  {
    target: 'body',
    content: 'ברוכים הבאים לדף חישוב אחוזונים. תוכן זה יתעדכן בהמשך.',
    placement: 'center',
    disableBeacon: true,
  }
];

export const forwardLocalSteps: GuidedTourStep[] = [
  {
    target: 'body',
    content: 'ברוכים הבאים לדף חישובי הסתברויות. תוכן זה יתעדכן בהמשך.',
    placement: 'center',
    disableBeacon: true,
  }
];

export const tableLocalSteps: GuidedTourStep[] = [
  {
    target: 'body',
    content: 'ברוכים הבאים לטבלאות ההתפלגות. תוכן זה יתעדכן בהמשך.',
    placement: 'center',
    disableBeacon: true,
  }
];

export const formulaSheetLocalSteps: GuidedTourStep[] = [
  {
    target: 'body',
    content: 'ברוכים הבאים לדף הנוסחאות. תוכן זה יתעדכן בהמשך.',
    placement: 'center',
    disableBeacon: true,
  }
];

export function getTourStepsByMode(mode: TourMode): GuidedTourStep[] {
  switch (mode) {
    case 'global': return globalTourSteps;
    case 'hypothesis': return hypothesisLocalSteps;
    case 'inverse': return inverseLocalSteps;
    case 'forward': return forwardLocalSteps;
    case 'table': return tableLocalSteps;
    case 'formula-sheet': return formulaSheetLocalSteps;
    default: return [];
  }
}
