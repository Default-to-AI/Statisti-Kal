import React from 'react';
import { InlineMath } from 'react-katex';
import { TestQuestion } from './types';

export const mediumQuestions: TestQuestion[] = [
  {
    id: 'm1',
    type: 'open-calc',
    difficulty: 'medium',
    topic: 'סטטיסטיקה תיאורית',
    points: 10,
    prompt: <span>נתון המדגם הבא: <InlineMath math={String.raw`2, 4, 6`} />. חשבו את השונות המדגמית (<InlineMath math={String.raw`S^2`} />).</span>,
    rationale: <span>הממוצע הוא 4. סכום ריבועי הסטיות: <InlineMath math={String.raw`(2-4)^2 + (4-4)^2 + (6-4)^2 = 8`} />. חלוקה ב-<InlineMath math={String.raw`n-1=2`} /> תיתן <InlineMath math={String.raw`8/2 = 4`} />.</span>,
    correctAnswer: 4,
    tolerance: 0.1
  },
  {
    id: 'm2',
    type: 'open-calc',
    difficulty: 'medium',
    topic: 'התפלגות נורמלית',
    points: 10,
    prompt: <span>משתנה מקרי <InlineMath math={String.raw`X`} /> מתפלג נורמלית עם תוחלת <InlineMath math={String.raw`\mu = 50`} /> וסטיית תקן <InlineMath math={String.raw`\sigma = 4`} />. מהו ציון התקן (<InlineMath math={String.raw`Z`} />) של התצפית <InlineMath math={String.raw`x = 58`} />?</span>,
    rationale: <span><InlineMath math={String.raw`Z = \frac{58 - 50}{4} = 2`} />.</span>,
    correctAnswer: 2,
    tolerance: 0.1
  },
  {
    id: 'm3',
    type: 'multiple-choice',
    difficulty: 'medium',
    topic: 'רווחי סמך',
    points: 10,
    prompt: <span>חוקר חישב רווח סמך לתוחלת וקיבל <InlineMath math={String.raw`[40, 60]`} />. מהם ממוצע המדגם (<InlineMath math={String.raw`\bar{X}`} />) וטעות האמידה המקסימלית (<InlineMath math={String.raw`e`} />)?</span>,
    rationale: <span>ממוצע המדגם הוא מרכז הרווח (50), וטעות האמידה היא חצי מאורך הרווח (10).</span>,
    options: [
      { id: '1', label: 'א', text: <span><InlineMath math={String.raw`\bar{X} = 40, e = 20`} /></span> },
      { id: '2', label: 'ב', text: <span><InlineMath math={String.raw`\bar{X} = 50, e = 10`} /></span>, correct: true },
      { id: '3', label: 'ג', text: <span><InlineMath math={String.raw`\bar{X} = 50, e = 20`} /></span> }
    ]
  },
  {
    id: 'm4',
    type: 'multiple-choice',
    difficulty: 'medium',
    topic: 'בדיקת השערות',
    points: 10,
    prompt: <span>מה יקרה לעוצמת המבחן (<InlineMath math={String.raw`1-\beta`} />) אם <strong>נקטין</strong> את רמת המובהקות (<InlineMath math={String.raw`\alpha`} />) תחת אותו גודל מדגם?</span>,
    rationale: <span>הקטנת <InlineMath math={String.raw`\alpha`} /> מגדילה את הסיכוי לטעות מסוג שני (<InlineMath math={String.raw`\beta`} />), ולכן עוצמת המבחן קטנה.</span>,
    options: [
      { id: '1', label: 'א', text: 'עוצמת המבחן תגדל' },
      { id: '2', label: 'ב', text: 'עוצמת המבחן תקטן', correct: true },
      { id: '3', label: 'ג', text: 'עוצמת המבחן לא תשתנה' }
    ]
  },
  {
    id: 'm5',
    type: 'multi-part',
    difficulty: 'medium',
    topic: 'התפלגות ממוצע המדגם',
    points: 20,
    prompt: <span>חוקר לקח מדגם מקרי של 16 תצפיות מאוכלוסייה בעלת התפלגות נורמלית. ממוצע המדגם שהתקבל הוא 100, והשונות המדגמית (<InlineMath math={String.raw`S^2`} />) היא 25.</span>,
    rationale: <span>לחישוב טעות התקן, אנו מוציאים שורש מהשונות (5) ומחלקים בשורש המדגם (4), כך שמתקבל 1.25. כיוון ששונות האוכלוסייה לא ידועה והשתמשנו בשונות מדגמית, משתמשים בהתפלגות t.</span>,
    parts: [
      {
        id: 'p1',
        type: 'open-calc',
        prompt: <span>מהי טעות התקן האמידה של הממוצע (<InlineMath math={String.raw`\frac{S}{\sqrt{n}}`} />)?</span>,
        correctAnswer: 1.25,
        tolerance: 0.05
      },
      {
        id: 'p2',
        type: 'multiple-choice',
        prompt: 'באיזו התפלגות נשתמש לבניית רווח סמך לתוחלת על בסיס נתונים אלו?',
        options: [
          { id: 'opt1', label: '1', text: 'התפלגות נורמלית (Z)' },
          { id: 'opt2', label: '2', text: 'התפלגות t של סטודנט', correct: true },
          { id: 'opt3', label: '3', text: 'התפלגות בינומית' }
        ]
      }
    ]
  },
  {
    id: 'm6',
    type: 'interactive-region',
    difficulty: 'medium',
    topic: 'בדיקת השערות - אזור דחייה',
    points: 10,
    prompt: <span>חוקר בודק את ההשערה שממוצע זמן התגובה התקצר בעקבות טיפול רפואי (<InlineMath math={String.raw`H_1: \mu < \mu_0`} />). סמנו על גבי הגרף היכן ימוקם <strong>אזור הדחייה</strong>.</span>,
    rationale: <span>מכיוון שהשערת המחקר בודקת כיוון קטן מ- (שמאלי), אזור הדחייה יהיה ממוקם כולה בזנב השמאלי של ההתפלגות.</span>,
    correctRegion: 'left'
  },
  {
    id: 'm7',
    type: 'open-calc',
    difficulty: 'medium',
    topic: 'קשר ומתאם',
    points: 10,
    prompt: <span>נתון כי <InlineMath math={String.raw`Var(X)=4`} /> ו-<InlineMath math={String.raw`Var(Y)=9`} />. השונות המשותפת היא <InlineMath math={String.raw`Cov(X,Y)=6`} />. חשבו את מקדם המתאם של פירסון (<InlineMath math={String.raw`r`} />).</span>,
    rationale: <span>סטיות התקן הן 2 ו-3 בהתאמה. מקדם המתאם הוא היחס בין השונות המשותפת למכפלת סטיות התקן: <InlineMath math={String.raw`r = \frac{6}{2 \cdot 3} = 1`} />.</span>,
    correctAnswer: 1,
    tolerance: 0.05
  },
  {
    id: 'm8',
    type: 'multiple-choice',
    difficulty: 'medium',
    topic: 'רווחי סמך',
    points: 10,
    prompt: <span>מה יקרה לרוחב רווח הסמך (אורכו) אם נגדיל את רמת הסמך (רמת הביטחון) מ-90% ל-95%, מבלי לשנות נתונים אחרים?</span>,
    rationale: <span>הגדלת רמת הסמך פירושה דרישה לביטחון גבוה יותר שנכיל את הפרמטר. לשם כך יש צורך ב"רשת רחבה יותר", כלומר הערך הקריטי של Z או t גדל, ולכן רווח הסמך מתארך.</span>,
    options: [
      { id: '1', label: 'א', text: 'רוחב הרווח יגדל', correct: true },
      { id: '2', label: 'ב', text: 'רוחב הרווח יקטן' },
      { id: '3', label: 'ג', text: 'רוחב הרווח לא ישתנה' }
    ]
  },
  {
    id: 'm9',
    type: 'open-calc',
    difficulty: 'medium',
    topic: 'התפלגות נורמלית',
    points: 10,
    prompt: <span>מהו הערך הקריטי המקורב (<InlineMath math={String.raw`Z_{1-\alpha/2}`} />) עבור מבחן דו-צדדי ברמת מובהקות של <InlineMath math={String.raw`\alpha = 0.05`} />?</span>,
    rationale: <span>במבחן דו-צדדי עם מובהקות של 5%, מחלקים את ה-5% לשני הזנבות (2.5% בכל זנב). השטח המצטבר עד לערך הקריטי העליון הוא 0.975, שמתאים לערך תקן של 1.96.</span>,
    correctAnswer: 1.96,
    tolerance: 0.05
  },
  {
    id: 'm10',
    type: 'interactive-region',
    difficulty: 'medium',
    topic: 'בדיקת השערות - P-value',
    points: 10,
    prompt: <span>במבחן חד-צדדי ימני (<InlineMath math={String.raw`H_1: \mu > \mu_0`} />), התקבל סטטיסטי מבחן מסוים. סמנו על הגרף היכן מיוצג ה-P-value ביחס לסטטיסטי המבחן (הקו האנכי).</span>,
    rationale: <span>ה-P-value הוא ההסתברות לקבל תוצאה חריגה מזו שהתקבלה במדגם, לכיוון השערת המחקר. מאחר שההשערה היא ימנית, ה-P-value מחושב כשטח בזנב הימני, מימין לסטטיסטי המבחן.</span>,
    correctRegion: 'right'
  }
];
