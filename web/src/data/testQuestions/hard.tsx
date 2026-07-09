import React from 'react';
import { InlineMath } from 'react-katex';
import { TestQuestion } from './types';

export const hardQuestions: TestQuestion[] = [
  {
    id: 'h1',
    type: 'open-calc',
    difficulty: 'hard',
    topic: 'סטטיסטיקה תיאורית - קשר',
    points: 10,
    prompt: <span>נתון כי <InlineMath math={String.raw`Var(X)=4`} /> ו-<InlineMath math={String.raw`Var(Y)=9`} />. השונות המשותפת היא <InlineMath math={String.raw`Cov(X,Y)=-6`} />. מהו מקדם המתאם של פירסון (<InlineMath math={String.raw`r`} />)?</span>,
    rationale: <span><InlineMath math={String.raw`r = \frac{Cov(X,Y)}{S_X S_Y} = \frac{-6}{2 \cdot 3} = -1`} />.</span>,
    correctAnswer: -1,
    tolerance: 0.01
  },
  {
    id: 'h2',
    type: 'open-calc',
    difficulty: 'hard',
    topic: 'התפלגות נורמלית',
    points: 10,
    prompt: <span>ציוני מבחן מתפלגים נורמלית. ציון של 80 ממוקם בדיוק 2 סטיות תקן מעל הממוצע. ציון של 50 ממוקם בדיוק סטיית תקן 1 מתחת לממוצע. מהו הממוצע (<InlineMath math={String.raw`\mu`} />)?</span>,
    rationale: <span>מערכת משוואות: <InlineMath math={String.raw`\mu + 2\sigma = 80`} /> ו-<InlineMath math={String.raw`\mu - 1\sigma = 50`} />. המרחק (3 סטיות תקן) הוא 30. מכאן <InlineMath math={String.raw`\sigma = 10`} />. הצבה תיתן <InlineMath math={String.raw`\mu = 60`} />.</span>,
    correctAnswer: 60,
    tolerance: 0.1
  },
  {
    id: 'h3',
    type: 'open-calc',
    difficulty: 'hard',
    topic: 'רווחי סמך',
    points: 10,
    prompt: <span>חוקר מעוניין לאמוד תוחלת ברמת ביטחון של 95% (כאשר <InlineMath math={String.raw`Z_{0.975} = 1.96`} />). ידוע כי סטיית התקן באוכלוסייה היא <InlineMath math={String.raw`\sigma = 10`} />. החוקר דורש שטעות האמידה המקסימלית לא תעלה על <InlineMath math={String.raw`e = 2`} />. מהו גודל המדגם המינימלי הנדרש?</span>,
    rationale: <span>נוסחת גודל המדגם היא <InlineMath math={String.raw`n = (\frac{Z \cdot \sigma}{e})^2`} />. נציב: <InlineMath math={String.raw`n = (\frac{1.96 \cdot 10}{2})^2 = 9.8^2 = 96.04`} />. יש לעגל תמיד כלפי מעלה לגודל המדגם השלם הבא, ולכן נדרש <InlineMath math={String.raw`n = 97`} />.</span>,
    correctAnswer: 97,
    tolerance: 0.1
  },
  {
    id: 'h4',
    type: 'open-calc',
    difficulty: 'hard',
    topic: 'בדיקת השערות',
    points: 10,
    prompt: <span>שני מדגמים בלתי תלויים בגודל <InlineMath math={String.raw`n_1 = 11`} /> ו-<InlineMath math={String.raw`n_2 = 11`} /> נדגמו מהתפלגויות נורמליות בעלות שונויות שוות. השונויות המדגמיות שהתקבלו הן <InlineMath math={String.raw`S_1^2 = 20`} /> ו-<InlineMath math={String.raw`S_2^2 = 30`} />. חשב את השונות המדגמית המשותפת (המאוגדת) - <InlineMath math={String.raw`S_p^2`} />.</span>,
    rationale: <span>כאשר גדלי המדגמים שווים, השונות המשותפת היא הממוצע הפשוט של השונויות המדגמיות: <InlineMath math={String.raw`S_p^2 = \frac{20 + 30}{2} = 25`} />.</span>,
    correctAnswer: 25,
    tolerance: 0.1
  },
  {
    id: 'h5',
    type: 'multi-part',
    difficulty: 'hard',
    topic: 'חישוב שונות מסכומים',
    points: 20,
    prompt: <span>במדגם של <InlineMath math={String.raw`n = 10`} /> תצפיות התקבלו הסכומים הבאים: סכום התצפיות <InlineMath math={String.raw`\sum x_i = 50`} />, וסכום ריבועי התצפיות <InlineMath math={String.raw`\sum x_i^2 = 340`} />. חשבו את המדדים הבאים ללא שימוש ברשימת התצפיות הגולמית.</span>,
    rationale: <span>הממוצע הוא סכום התצפיות חלקי מספרן. עבור השונות, נשתמש בנוסחת העבודה: <InlineMath math={String.raw`\sum(x_i-\bar{x})^2 = \sum x_i^2 - n\bar{x}^2 = 340 - 10(25) = 90`} />. נחלק ל-<InlineMath math={String.raw`n-1 = 9`} /> כדי לקבל את השונות המדגמית שהיא 10.</span>,
    parts: [
      {
        id: 'p1',
        type: 'open-calc',
        prompt: <span>מהו ממוצע המדגם (<InlineMath math={String.raw`\bar{x}`} />)?</span>,
        correctAnswer: 5,
        tolerance: 0.05
      },
      {
        id: 'p2',
        type: 'open-calc',
        prompt: <span>מהי השונות המדגמית (<InlineMath math={String.raw`S^2`} />)?</span>,
        correctAnswer: 10,
        tolerance: 0.05
      }
    ]
  },
  {
    id: 'h6',
    type: 'interactive-region',
    difficulty: 'hard',
    topic: 'בדיקת השערות',
    points: 10,
    prompt: <span>חוקר מבצע מבחן דו-צדדי. אם החוקר ביצע <strong>טעות מסוג ראשון</strong> במבחן, באיזה אזור או אזורים נפל סטטיסטי המבחן שחישב?</span>,
    rationale: <span>טעות מסוג ראשון משמעותה שדחינו את השערת האפס בטעות. במבחן דו-צדדי, הדבר מתרחש אם סטטיסטי המבחן נופל באחד מאזורי הדחייה, כלומר בשני קצות ההתפלגות (הזנבות).</span>,
    correctRegion: 'both'
  },
  {
    id: 'h7',
    type: 'open-calc',
    difficulty: 'hard',
    topic: 'קשר ומתאם',
    points: 10,
    prompt: <span>מקדם המתאם של פירסון בין <InlineMath math={String.raw`X`} /> ל-<InlineMath math={String.raw`Y`} /> הוא <InlineMath math={String.raw`r = 0.5`} />. השונות המשותפת היא <InlineMath math={String.raw`Cov(X,Y) = 10`} />, ושונות משתנה <InlineMath math={String.raw`X`} /> היא <InlineMath math={String.raw`16`} />. מהי <strong>סטיית התקן</strong> של משתנה <InlineMath math={String.raw`Y`} />?</span>,
    rationale: <span>מתוך הנוסחה <InlineMath math={String.raw`r = \frac{Cov}{S_X S_Y}`} /> אנו יודעים כי <InlineMath math={String.raw`S_X = \sqrt{16} = 4`} />. לכן <InlineMath math={String.raw`0.5 = \frac{10}{4 \cdot S_Y}`} />. משוואה זו נפתרת ל-<InlineMath math={String.raw`4 \cdot S_Y = 20`} />, ולכן <InlineMath math={String.raw`S_Y = 5`} />.</span>,
    correctAnswer: 5,
    tolerance: 0.1
  },
  {
    id: 'h8',
    type: 'open-calc',
    difficulty: 'hard',
    topic: 'טעויות מבחן ועוצמה',
    points: 10,
    prompt: <span>חוקר תכנן ניסוי עם רמת מובהקות <InlineMath math={String.raw`\alpha = 0.05`} /> וחישב כי עוצמת המבחן היא 0.80 (<InlineMath math={String.raw`1-\beta = 0.80`} />). מהי ההסתברות לבצע טעות מסוג שני (<InlineMath math={String.raw`\beta`} />)?</span>,
    rationale: <span>עוצמת המבחן מוגדרת כמשלים של טעות מסוג שני: <InlineMath math={String.raw`1-\beta`} />. אם העוצמה היא 0.80, הרי שההסתברות לטעות מסוג שני היא <InlineMath math={String.raw`1 - 0.80 = 0.20`} />.</span>,
    correctAnswer: 0.2,
    tolerance: 0.01
  },
  {
    id: 'h9',
    type: 'open-calc',
    difficulty: 'hard',
    topic: 'בדיקת השערות',
    points: 10,
    prompt: <span>חוקר בודק השערה לגבי תוחלת האוכלוסייה: <InlineMath math={String.raw`H_0: \mu=100`} />. הוא אוסף מדגם בגודל <InlineMath math={String.raw`n=36`} /> ומקבל ממוצע מדגמי <InlineMath math={String.raw`\bar{X}=103`} /> עם סטיית תקן מדגמית <InlineMath math={String.raw`S=12`} />. חשבו את ערכו של סטטיסטי המבחן.</span>,
    rationale: <span>סטטיסטי המבחן מחושב כהפרש בין ממוצע המדגם לתוחלת תחת השערת האפס, מחולק בטעות התקן. <InlineMath math={String.raw`t = \frac{103 - 100}{12 / \sqrt{36}} = \frac{3}{12/6} = \frac{3}{2} = 1.5`} />.</span>,
    correctAnswer: 1.5,
    tolerance: 0.01
  },
  {
    id: 'h10',
    type: 'multi-part',
    difficulty: 'hard',
    topic: 'מבחנים לשונות',
    points: 10,
    prompt: <span>משקיע רוצה לבדוק האם שונות התשואות של מניית טבע שונה מ-10. הוא דוגם 15 ימי מסחר ומוצא שונות מדגמית של 14.</span>,
    rationale: <span>מבחן לשונות בודדת כאשר האוכלוסייה מתפלגת נורמלית מתבצע בעזרת התפלגות חי-בריבוע (<InlineMath math={String.raw`\chi^2`} />). מספר דרגות החופש הוא <InlineMath math={String.raw`n-1 = 14`} />.</span>,
    parts: [
      {
        id: 'p1',
        type: 'multiple-choice',
        prompt: 'באיזה נתון התפלגותי (סטטיסטי) נשתמש לבדיקת ההשערה על השונות?',
        options: [
          { id: '1', label: '1', text: 'התפלגות t' },
          { id: '2', label: '2', text: 'התפלגות Z' },
          { id: '3', label: '3', text: 'התפלגות חי-בריבוע', correct: true }
        ]
      },
      {
        id: 'p2',
        type: 'open-calc',
        prompt: 'כמה דרגות חופש יהיו להתפלגות במבחן זה?',
        correctAnswer: 14,
        tolerance: 0.01
      }
    ]
  }
];
