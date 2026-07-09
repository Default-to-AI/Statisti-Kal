import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { TestQuestion } from './types';

export const examQuestions: TestQuestion[] = [
  {
    id: 'exam1',
    type: 'multi-part',
    difficulty: 'exam',
    topic: 'תורת האמידה והשוואת אומדים',
    points: 20,
    prompt: (
      <div className="space-y-4 text-right">
        <p>
          יהי <InlineMath math={String.raw`X_1, X_2, X_3`} /> מדגם אקראי בגודל <InlineMath math={String.raw`n=3`} /> מתוך התפלגות בעלת תוחלת <InlineMath math={String.raw`\mu`} /> ושונות <InlineMath math={String.raw`\sigma^2`} />.
        </p>
        <p>
          הוצעו שני אומדים לתוחלת:
          <BlockMath math={String.raw`T_1 = \frac{X_1 + 2X_2 + X_3}{4}`} />
          <BlockMath math={String.raw`T_2 = \bar{X} = \frac{X_1 + X_2 + X_3}{3}`} />
        </p>
      </div>
    ),
    rationale: (
      <div className="space-y-4 text-right mt-4 text-sm">
        <p className="font-bold">פתרון שאלה 1:</p>
        <p><strong>א. בדיקת חוסר הטיה:</strong> תוחלת כל אומד צריכה להיות <InlineMath math={String.raw`\mu`} />.</p>
        <BlockMath math={String.raw`E[T_1] = \frac{1}{4}(E[X_1] + 2E[X_2] + E[X_3]) = \frac{\mu + 2\mu + \mu}{4} = \mu`} />
        <BlockMath math={String.raw`E[T_2] = E[\bar{X}] = \mu`} />
        <p>לכן שני האומדים חסרי הטיה.</p>
        <p><strong>ב. השוואה לפי MSE:</strong> כיוון ששניהם חסרי הטיה, ה-MSE שווה לשונות. נחשב את השונויות:</p>
        <BlockMath math={String.raw`V(T_1) = \frac{1}{16}(V(X_1) + 4V(X_2) + V(X_3)) = \frac{6\sigma^2}{16} = 0.375\sigma^2`} />
        <BlockMath math={String.raw`V(T_2) = V(\bar{X}) = \frac{\sigma^2}{3} \approx 0.333\sigma^2`} />
        <p>כיוון ש-<InlineMath math={String.raw`0.333\sigma^2 < 0.375\sigma^2`} />, האומד <InlineMath math={String.raw`T_2`} /> בעל שונות קטנה יותר ולכן עדיף.</p>
      </div>
    ),
    parts: [
      {
        id: 'p1',
        type: 'multiple-choice',
        prompt: 'האם האומדים חסרי הטיה?',
        options: [
          { id: '1', label: '1', text: 'רק T1 חסר הטיה' },
          { id: '2', label: '2', text: 'רק T2 חסר הטיה' },
          { id: '3', label: '3', text: 'שניהם חסרי הטיה', correct: true },
          { id: '4', label: '4', text: 'אף אחד מהם אינו חסר הטיה' }
        ]
      },
      {
        id: 'p2',
        type: 'multiple-choice',
        prompt: 'איזה אומד עדיף לפי קריטריון MSE (טעות ריבועית ממוצעת)?',
        options: [
          { id: '1', label: '1', text: 'T1 עדיף (בעל MSE קטן יותר)' },
          { id: '2', label: '2', text: 'T2 עדיף (בעל MSE קטן יותר)', correct: true },
          { id: '3', label: '3', text: 'לשניהם אותו MSE בדיוק' }
        ]
      }
    ]
  },
  {
    id: 'exam2',
    type: 'multi-part',
    difficulty: 'exam',
    topic: 'התפלגות אחידה והסתברות מותנית',
    points: 20,
    prompt: (
      <div className="space-y-4 text-right">
        <p>
          הזמן (בדקות) שלוקח לסטודנט לפתור שאלת הבנה במבחן מתפלג אחיד רציף: <InlineMath math={String.raw`X \sim U(10, 50)`} />.
        </p>
      </div>
    ),
    rationale: (
      <div className="space-y-4 text-right mt-4 text-sm">
        <p className="font-bold">פתרון שאלה 2:</p>
        <p><strong>א. תוחלת וסטיית תקן:</strong></p>
        <BlockMath math={String.raw`E[X] = \frac{10+50}{2} = 30`} />
        <BlockMath math={String.raw`V(X) = \frac{(50-10)^2}{12} = \frac{1600}{12} \approx 133.33 \implies \sigma_X = \sqrt{133.33} \approx 11.55`} />
        <p><strong>ב. הסתברות מותנית:</strong></p>
        <BlockMath math={String.raw`P(X < 40 \mid X > 20) = \frac{P(20 < X < 40)}{P(X > 20)} = \frac{20/40}{30/40} = \frac{2}{3} \approx 0.6667`} />
      </div>
    ),
    parts: [
      {
        id: 'p1',
        type: 'open-calc',
        prompt: <span>מהי תוחלת זמן הפתרון (<InlineMath math={String.raw`E[X]`} />)?</span>,
        correctAnswer: 30,
        tolerance: 0.1
      },
      {
        id: 'p2',
        type: 'open-calc',
        prompt: <span>מהי סטיית התקן של זמן הפתרון? (תשובה בדיוק של 2 ספרוֹת)</span>,
        correctAnswer: 11.55,
        tolerance: 0.1
      },
      {
        id: 'p3',
        type: 'open-calc',
        prompt: <span>ידוע כי זמן הפתרון ארך מעל ל-20 דקות. מהי ההסתברות שהיה קצר מ-40 דקות?</span>,
        correctAnswer: 0.6667,
        tolerance: 0.01
      }
    ]
  },
  {
    id: 'exam3',
    type: 'multi-part',
    difficulty: 'exam',
    topic: 'בדיקת השערות, טעויות ועוצמת מבחן',
    points: 20,
    prompt: (
      <div className="space-y-4 text-right">
        <p>
          גובה צמחים מתפלג נורמלית עם תוחלת <InlineMath math={String.raw`\mu = 120`} /> וסטיית תקן <InlineMath math={String.raw`\sigma = 15`} />. 
          חוקר פיתח דשן שלטענתו מגדיל את התוחלת (ללא שינוי בסטיית התקן).
          נלקח מדגם של <InlineMath math={String.raw`n = 25`} />.
        </p>
        <p>
          כלל ההכרעה: נדחה את השערת האפס אם <InlineMath math={String.raw`\bar{X} > 125`} />.
        </p>
        <p>נתון לנוסחאות: <InlineMath math={String.raw`\Phi(1.67)=0.9525`} />, <InlineMath math={String.raw`\Phi(1)=0.8413`} />.</p>
      </div>
    ),
    rationale: (
      <div className="space-y-4 text-right mt-4 text-sm">
        <p className="font-bold">פתרון שאלה 3:</p>
        <p><strong>א. השערות:</strong> <InlineMath math={String.raw`H_0: \mu = 120`} />, <InlineMath math={String.raw`H_1: \mu > 120`} />.</p>
        <p><strong>ב. מובהקות (<InlineMath math={String.raw`\alpha`} />):</strong></p>
        <BlockMath math={String.raw`\alpha = P(\bar{X} > 125 \mid \mu=120) = P(Z > \frac{125-120}{15/5}) = P(Z > 1.67) = 1 - 0.9525 = 0.0475`} />
        <p><strong>ג. עוצמת המבחן (<InlineMath math={String.raw`1-\beta`} />):</strong> תחת <InlineMath math={String.raw`\mu=128`} />:</p>
        <BlockMath math={String.raw`P(\bar{X} > 125 \mid \mu=128) = P(Z > \frac{125-128}{3}) = P(Z > -1) = \Phi(1) = 0.8413`} />
        <p><strong>ד. טעות מסוג שני:</strong> להסיק שהדשן אינו מגדיל את התוחלת, כאשר בפועל הוא כן מגדיל.</p>
      </div>
    ),
    parts: [
      {
        id: 'p1',
        type: 'open-calc',
        prompt: <span>מהי רמת המובהקות (<InlineMath math={String.raw`\alpha`} />) של המבחן?</span>,
        correctAnswer: 0.0475,
        tolerance: 0.005
      },
      {
        id: 'p2',
        type: 'open-calc',
        prompt: <span>בהנחה שהדשן אכן יעיל ומעלה את תוחלת הגובה ל-<InlineMath math={String.raw`\mu = 128`} />, מהי עוצמת המבחן (<InlineMath math={String.raw`1-\beta`} />)?</span>,
        correctAnswer: 0.8413,
        tolerance: 0.01
      },
      {
        id: 'p3',
        type: 'multiple-choice',
        prompt: 'מהי המשמעות המעשית של טעות מסוג שני במחקר זה?',
        options: [
          { id: '1', label: '1', text: 'לטעון שהדשן מגדיל את התוחלת, למרות שהוא אינו עושה זאת בפועל.' },
          { id: '2', label: '2', text: 'לטעון שהדשן אינו מגדיל את התוחלת, למרות שהוא כן מגדיל אותה בפועל.', correct: true },
          { id: '3', label: '3', text: 'לטעון שסטיית התקן השתנתה בעקבות הדשן.' }
        ]
      }
    ]
  },
  {
    id: 'exam4',
    type: 'multi-part',
    difficulty: 'exam',
    topic: 'רווחי סמך',
    points: 20,
    prompt: (
      <div className="space-y-4 text-right">
        <p>
          <strong>חלק 1:</strong> חוקרת בונה רווח סמך לתוחלת ברמת סמך 95% (כאשר <InlineMath math={String.raw`Z_{0.975} = 1.96`} />).
          סטיית התקן היא <InlineMath math={String.raw`\sigma = 10`} />. דרישת החוקרת היא שאורך רווח הסמך (L) לא יעלה על 4.
        </p>
        <p>
          <strong>חלק 2:</strong> שני חוקרים אמדו תוחלת ברמת סמך 95%. לחוקר א' ולחוקר ב' מדגמים מאזורים שונים (צפון ומרכז). 
          בשני המדגמים <InlineMath math={String.raw`n=100`} />, וסטיית התקן <InlineMath math={String.raw`\sigma`} /> ידועה וזהה לחלוטין.
        </p>
      </div>
    ),
    rationale: (
      <div className="space-y-4 text-right mt-4 text-sm">
        <p className="font-bold">פתרון שאלה 4:</p>
        <p><strong>חלק 1:</strong> הנוסחה לאורך רווח היא <InlineMath math={String.raw`L = 2 \cdot Z \cdot \frac{\sigma}{\sqrt{n}}`} />.</p>
        <BlockMath math={String.raw`2 \cdot 1.96 \cdot \frac{10}{\sqrt{n}} \le 4 \implies \sqrt{n} \ge 9.8 \implies n \ge 96.04 \implies n = 97`} />
        <p><strong>חלק 2:</strong> אורך הרווח תלוי רק ב-<InlineMath math={String.raw`n, \sigma, Z`} /> (שכולם זהים), לכן האורך זהה. גבולות הרווח תלויים ב-<InlineMath math={String.raw`\bar{X}`} />, שסביר שיהיה שונה בין שני המדגמים, לכן הגבולות אינם בהכרח זהים.</p>
      </div>
    ),
    parts: [
      {
        id: 'p1',
        type: 'open-calc',
        prompt: <span>מהו גודל המדגם המינימלי הנדרש כדי להבטיח את דרישת החוקרת? (עגלו תמיד לשלם)</span>,
        correctAnswer: 97,
        tolerance: 0.1
      },
      {
        id: 'p2',
        type: 'multiple-choice',
        prompt: 'איזו מן הטענות הבאות נכונה בהכרח לגבי החוקרים בחלק 2?',
        options: [
          { id: '1', label: '1', text: 'אורך הרווח בהכרח זהה, וגבולות הרווח בהכרח זהים.' },
          { id: '2', label: '2', text: 'אורך הרווח אינו בהכרח זהה, אך גבולות הרווח בהכרח זהים.' },
          { id: '3', label: '3', text: 'אורך הרווח בהכרח זהה, אך גבולות הרווח אינם בהכרח זהים.', correct: true },
          { id: '4', label: '4', text: 'אף טענה אינה נכונה בהכרח.' }
        ]
      }
    ]
  },
  {
    id: 'exam5',
    type: 'multi-part',
    difficulty: 'exam',
    topic: 'קשר וטרנספורמציות',
    points: 20,
    prompt: (
      <div className="space-y-4 text-right">
        <p>
          נמדדו משתנים <InlineMath math={String.raw`X`} /> (מבחן) ו-<InlineMath math={String.raw`Y`} /> (עבודת בית). נתונים:
          <br/>
          <InlineMath math={String.raw`\bar{X} = 70, S_X = 8`} /><br/>
          <InlineMath math={String.raw`\bar{Y} = 85, S_Y = 12`} /><br/>
          מקדם המתאם הוא <InlineMath math={String.raw`r = 0.60`} />.
        </p>
        <p>
          בוצעה טרנספורמציה (פקטור): <InlineMath math={String.raw`W = 1.1X + 5`} />.
        </p>
      </div>
    ),
    rationale: (
      <div className="space-y-4 text-right mt-4 text-sm">
        <p className="font-bold">פתרון שאלה 5:</p>
        <p><strong>א. ממוצע וסטיית תקן של W:</strong></p>
        <BlockMath math={String.raw`E[W] = 1.1 \cdot 70 + 5 = 82`} />
        <BlockMath math={String.raw`S_W = |1.1| \cdot 8 = 8.8`} />
        <p><strong>ב. מקדם המתאם:</strong> כיוון שהוכפלנו בקבוע חיובי (1.1), מתאם פירסון אינו משתנה: <InlineMath math={String.raw`r_{W,Y} = 0.60`} />.</p>
      </div>
    ),
    parts: [
      {
        id: 'p1',
        type: 'open-calc',
        prompt: <span>מה יהיה הממוצע החדש של <InlineMath math={String.raw`W`} />?</span>,
        correctAnswer: 82,
        tolerance: 0.1
      },
      {
        id: 'p2',
        type: 'open-calc',
        prompt: <span>מה תהיה סטיית התקן החדשה של <InlineMath math={String.raw`W`} />?</span>,
        correctAnswer: 8.8,
        tolerance: 0.1
      },
      {
        id: 'p3',
        type: 'open-calc',
        prompt: <span>מה יהיה מקדם המתאם הליניארי בין <InlineMath math={String.raw`W`} /> ל-<InlineMath math={String.raw`Y`} />?</span>,
        correctAnswer: 0.60,
        tolerance: 0.01
      }
    ]
  }
];
