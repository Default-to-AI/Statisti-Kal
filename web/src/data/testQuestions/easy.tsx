import React from 'react';
import { InlineMath } from 'react-katex';
import { TestQuestion } from './types';

export const easyQuestions: TestQuestion[] = [
  {
    id: 'e1',
    type: 'multiple-choice',
    difficulty: 'easy',
    topic: 'סטטיסטיקה תיאורית',
    points: 10,
    prompt: <span>מה קורה לסטיית התקן של מדגם אם מוסיפים קבוע <InlineMath math={String.raw`C`} /> לכל אחת מהתצפיות?</span>,
    rationale: <span>הוספת קבוע לכל התצפיות מזיזה את ההתפלגות כולה, אך אינה משנה את הפיזור, ולכן סטיית התקן נשארת ללא שינוי.</span>,
    options: [
      { id: '1', label: 'א', text: <span>גדלה ב-<InlineMath math={String.raw`C`} /></span> },
      { id: '2', label: 'ב', text: <span>גדלה ב-<InlineMath math={String.raw`C^2`} /></span> },
      { id: '3', label: 'ג', text: 'נשארת ללא שינוי', correct: true },
      { id: '4', label: 'ד', text: 'תלויה בערך הקבוע' }
    ]
  },
  {
    id: 'e2',
    type: 'multiple-choice',
    difficulty: 'easy',
    topic: 'תורת האמידה',
    points: 10,
    prompt: <span>איזה מהתנאים הבאים מגדיר אומד <InlineMath math={String.raw`\hat{\theta}`} /> כ"חסר הטיה" (Unbiased) לפרמטר <InlineMath math={String.raw`\theta`} />?</span>,
    rationale: 'אומד מוגדר חסר הטיה אם תוחלת האומד שווה לערך האמיתי של הפרמטר באוכלוסייה.',
    options: [
      { id: '1', label: 'א', latex: String.raw`E(\hat{\theta}) = \theta`, correct: true },
      { id: '2', label: 'ב', latex: String.raw`Var(\hat{\theta}) = 0` },
      { id: '3', label: 'ג', latex: String.raw`E(\hat{\theta}) = 0` },
      { id: '4', label: 'ד', latex: String.raw`MSE = 0` }
    ]
  },
  {
    id: 'e3',
    type: 'multiple-choice',
    difficulty: 'easy',
    topic: 'רווחי סמך',
    points: 10,
    prompt: <span>כיצד יושפע אורך רווח הסמך לתוחלת אם נגדיל את גודל המדגם (<InlineMath math={String.raw`n`} />) ונשמור על רמת ביטחון זהה?</span>,
    rationale: <span>אורך רווח הסמך נמצא ביחס הפוך לשורש גודל המדגם. לכן, הגדלת המדגם מקטינה את טעות האמידה ומקצרת את רווח הסמך.</span>,
    options: [
      { id: '1', label: 'א', text: 'יתארך' },
      { id: '2', label: 'ב', text: 'יתקצר', correct: true },
      { id: '3', label: 'ג', text: 'לא ישתנה' }
    ]
  },
  {
    id: 'e4',
    type: 'open-text',
    difficulty: 'easy',
    topic: 'בדיקת השערות',
    points: 10,
    prompt: <span>אם <InlineMath math={String.raw`P\text{-value} = 0.03`} /> ורמת המובהקות היא <InlineMath math={String.raw`\alpha = 0.05`} />, האם <strong>נדחה</strong> או <strong>לא נדחה</strong> את השערת האפס?</span>,
    rationale: <span>מכיוון שה-P-value קטן מרמת המובהקות, התוצאה מובהקת ואנו דוחים את השערת האפס.</span>,
    correctAnswers: ['נדחה', 'דוחים', 'דוחה']
  },
  {
    id: 'e5',
    type: 'multiple-choice',
    difficulty: 'easy',
    topic: 'סטטיסטיקה תיאורית',
    points: 10,
    prompt: <span>איזה ממדדי המרכז הבאים פחות רגיש לתצפיות קיצוניות (Outliers)?</span>,
    rationale: <span>החציון מבוסס רק על סדר התצפיות ומיקומן באמצע, לכן ערך קיצוני מאוד לא ישפיע עליו בניגוד לממוצע שמושפע מגודל התצפיות.</span>,
    options: [
      { id: '1', label: 'א', text: 'ממוצע' },
      { id: '2', label: 'ב', text: 'חציון', correct: true },
      { id: '3', label: 'ג', text: 'טווח (Range)' },
      { id: '4', label: 'ד', text: 'כל המדדים רגישים באותה מידה' }
    ]
  },
  {
    id: 'e6',
    type: 'open-calc',
    difficulty: 'easy',
    topic: 'סטטיסטיקה תיאורית',
    points: 10,
    prompt: <span>חשבו את הממוצע של חמשת המספרים הבאים: 2, 4, 6, 8, 10.</span>,
    rationale: <span><InlineMath math={String.raw`\frac{2+4+6+8+10}{5} = \frac{30}{5} = 6`} /></span>,
    correctAnswer: 6,
    tolerance: 0.01
  },
  {
    id: 'e7',
    type: 'multiple-choice',
    difficulty: 'easy',
    topic: 'התפלגות נורמלית סטנדרטית',
    points: 10,
    prompt: <span>מהם התוחלת (<InlineMath math={String.raw`\mu`} />) וסטיית התקן (<InlineMath math={String.raw`\sigma`} />) של ההתפלגות הנורמלית הסטנדרטית (<InlineMath math={String.raw`Z`} />)?</span>,
    rationale: <span>ההתפלגות הנורמלית הסטנדרטית מאופיינת בתוחלת אפס וסטיית תקן אחת: <InlineMath math={String.raw`Z \sim N(0, 1)`} />.</span>,
    options: [
      { id: '1', label: 'א', text: <span><InlineMath math={String.raw`\mu = 1, \sigma = 0`} /></span> },
      { id: '2', label: 'ב', text: <span><InlineMath math={String.raw`\mu = 0, \sigma = 1`} /></span>, correct: true },
      { id: '3', label: 'ג', text: <span><InlineMath math={String.raw`\mu = 0, \sigma = 0`} /></span> },
      { id: '4', label: 'ד', text: <span><InlineMath math={String.raw`\mu = 1, \sigma = 1`} /></span> }
    ]
  },
  {
    id: 'e8',
    type: 'multiple-choice',
    difficulty: 'easy',
    topic: 'סולמות מדידה',
    points: 10,
    prompt: <span>איזה סולם מדידה מתאים למשתנה "דרגת בצבא" (רב"ט, סמל, סמ"ר, קצין)?</span>,
    rationale: <span>הקטגוריות בעלות סדר לוגי (דרגה אחת גבוהה מהשנייה), אך המרווחים ביניהן לא מדידים במדויק, לכן זהו סולם סדר.</span>,
    options: [
      { id: '1', label: 'א', text: 'סולם שמי (נומינלי)' },
      { id: '2', label: 'ב', text: 'סולם סדר (אורדינלי)', correct: true },
      { id: '3', label: 'ג', text: 'סולם רווח/מנה' }
    ]
  },
  {
    id: 'e9',
    type: 'open-calc',
    difficulty: 'easy',
    topic: 'סטטיסטיקה תיאורית',
    points: 10,
    prompt: <span>חוקר דגם 3 תצפיות: 10, 10, 10. מהי השונות המדגמית (<InlineMath math={String.raw`S^2`} />)?</span>,
    rationale: <span>כל התצפיות שוות זו לזו (ולממוצע), לכן אין שום פיזור סביב הממוצע והשונות היא אפס.</span>,
    correctAnswer: 0,
    tolerance: 0.01
  },
  {
    id: 'e10',
    type: 'multiple-choice',
    difficulty: 'easy',
    topic: 'בדיקת השערות',
    points: 10,
    prompt: <span>בהשערה דו-צדדית (Two-tailed test), היכן נמצא אזור הדחייה?</span>,
    rationale: <span>בהשערה דו-צדדית השערת המחקר מוגדרת כ"שונה מ-", ולכן אזור הדחייה מחולק לשני קצוות ההתפלגות.</span>,
    options: [
      { id: '1', label: 'א', text: 'רק בזנב הימני' },
      { id: '2', label: 'ב', text: 'רק בזנב השמאלי' },
      { id: '3', label: 'ג', text: 'בשני הזנבות', correct: true },
      { id: '4', label: 'ד', text: 'במרכז ההתפלגות' }
    ]
  }
];
