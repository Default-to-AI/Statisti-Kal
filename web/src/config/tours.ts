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
    content: 'זה הדף הראשי - בדיקת השערות. מזינים מאפייני ההתפלגות של האוכלוסיה והמדגם ולראות שלב-אחר-שלב את תהליך בדיקת ההשערות בכל המקרים/כיווני מבחנים האפשריים. הדף דינאמי ומשתנה בהתאם לנתונים שמזינים. בתחתית, יש סקטור מיועד לרווח סמך ועוצמת המבחן. שימו לב שבכל דף קיים כפתור "סיור מודרך" לסיור ממוקד רק לאותו דף.',
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
  },
  {
    target: '.tour-local-trigger',
    content: 'זהו כפתור הסיור המקומי. לכל דף באפליקציה יש סיור משלו, הרבה יותר מפורט. לחצו עליו כדי להתחיל את הסיור המקומי!',
    placement: 'bottom',
    context: { page: 'hypothesis' },
  }
];

export const hypothesisLocalSteps: GuidedTourStep[] = [
  {
    target: '.tour-step-intro',
    content: 'ברוכים הבאים לסיור המודרך לדף בדיקת השערות. נתחיל מלמעלה ונרד לפי הסדר שבו הרכיבים מופיעים.',
    disableBeacon: true,
    placement: 'center',
  },
  {
    target: '.tour-step-inputs',
    content: 'כאן מזינים את הפרמטרים של אוכלוסיית הבסיס, של המדגם, ושל השערת המחקר האלטרנטיבית.',
    placement: 'right',
  },
  {
    target: '.tour-power-quick-link',
    content: 'זהו קישור מהיר לעוצמת המבחן. לחיצה עליו פותחת את אקורדיון ה-Power ומקפיצה ישירות לחישוב המלא.',
    placement: 'bottom',
  },
  {
    target: '.tour-step-graph',
    content: 'זהו אזור הגרף. כאן רואים את התפלגות הדגימה, את אזור הדחייה, את האזור שאינו דחייה, ואת האזורים שנצבעים בזמן אמת.',
    placement: 'left',
  },
  {
    target: '.tour-step-graph-toggle',
    content: 'המתג הזה מציג או מסתיר את השערת המחקר בגרף, יחד עם אזור עוצמת המבחן. כך אפשר לראות ישירות את הקשר בין H₁ לבין 1-β.',
    placement: 'bottom',
  },
  {
    target: '.tour-step-decision',
    content: 'מטריצת ההחלטה מסכמת את ארבעת המצבים: דחייה נכונה, אי-דחייה נכונה, טעות מסוג I, וטעות מסוג II.',
    placement: 'top',
  },
  {
    target: '.tour-step-accordion-ht',
    content: 'באקורדיון הזה תמצאו את ששת שלבי פתרון בדיקת ההשערות, מניסוח ההשערות ועד קבלת המסקנה.',
    placement: 'top',
  },
  {
    target: '.tour-step-test-type',
    content: 'כאן בוחרים את סוג המבחן ואת הכיוון שלו, כלומר האם הבדיקה שמאלית, ימנית או דו-צדדית.',
    placement: 'bottom',
  },
  {
    target: '.tour-step-accordion-ci',
    content: 'כאן נמצא רווח הסמך, ומיד אחריו עוצמת המבחן. שני האזורים האלה משלימים את התמונה מעבר להחלטה הבסיסית של דחייה או אי-דחייה.',
    placement: 'top',
  },
  {
    target: '.tour-power-panel',
    content: 'כאן מופיע פירוק מלא של עוצמת המבחן: SE, ערך קריטי, חישוב Z תחת H₁, והמשמעות של 1-β מול β.',
    placement: 'top',
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
