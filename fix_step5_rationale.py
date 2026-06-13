import re

file_path = 'src/components/HypothesisTestingCalculator.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = "{/* Step 5: P-Value Calculation */}"
end_marker = "{/* Step 6: Final Decision Block */}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Could not find Step 5 markers")
    exit(1)

replacement = """{/* Step 5: P-Value Calculation */}
  <div className="space-y-4 pt-4 border-t border-slate-800/60 mt-4 text-right">
    <div className="flex items-center gap-3 font-extrabold text-indigo-400">
      <span className="w-9 h-9 rounded-full bg-indigo-100 bg-indigo-900/50 text-base font-black flex items-center justify-center border border-indigo-300 shrink-0">5</span>
      <span className="text-xl sm:text-2xl font-black">חישוב ופירוש ערך ה-P-Value</span>
    </div>
    
    <div className="pr-5 py-1 space-y-4">
      <div className="space-y-2 text-sm sm:text-base text-slate-100 font-medium leading-relaxed bg-slate-950/30 p-4 rounded-xl border border-slate-800/50">
        <p>
          <strong className="text-indigo-300">הרציונל הסטטיסטי למדד המבחן:</strong> מדד המבחן ({varianceKnown ? <InlineMath math="Z" /> : <InlineMath math="t" />}) מחושב על ידי בדיקת המרחק בין ממוצע המדגם שנצפה בפועל (<InlineMath math="\\bar{X}" />) לבין התוחלת המשוערת תחת השערת האפס (<InlineMath math="\\mu_0" />).
          מרחק גולמי זה מחולק בשגיאת התקן (<InlineMath math="SE" />) על מנת לתקנן אותו. 
        </p>
        <p>
          תקנון זה אומר לנו בדיוק <strong>כמה שגיאות תקן מרוחק המדגם שלנו</strong> מההשערה המקורית. אם המדגם קרוב לתוחלת המקורית (הפרש קרוב ל-0), התוצאה סבירה תחת <InlineMath math="H_0" />. ככל שהמרחק גדול יותר בערכו המוחלט, כך גוברות הראיות האמפיריות נגד השערת האפס.
        </p>
      </div>

      <div className="w-full overflow-x-auto py-2 scrollbar-thin mt-2" dir="ltr">
        <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border-2 border-slate-800 space-y-3 text-lg sm:text-xl md:text-2xl text-center shadow-inner font-extrabold min-w-[280px]">
          {varianceKnown ? (
            <>
              <BlockMath math={`Z_{\\text{stat}} = \\frac{\\bar{X} - \\mu_0}{SE} = \\frac{${mu1} - ${mu0}}{${stats.se.toFixed(4)}} = ${decisionData.statObs.toFixed(4)}`} />
              <BlockMath math={`\\text{P-Value} = ${tailType === 'right' ? `P(Z > Z_{\\text{stat}})` : tailType === 'left' ? `P(Z < Z_{\\text{stat}})` : `2 \\cdot P(|Z| > |Z_{\\text{stat}}|)`} = ${decisionData.pValue.toFixed(4)}`} />
            </>
          ) : (
            <>
              <BlockMath math={`t_{\\text{stat}} = \\frac{\\bar{X} - \\mu_0}{SE} = \\frac{${mu1} - ${mu0}}{${stats.se.toFixed(4)}} = ${decisionData.statObs.toFixed(4)}`} />
              <BlockMath math={`\\text{P-Value} = ${tailType === 'right' ? `P(t_{\\text{df}} > t_{\\text{stat}})` : tailType === 'left' ? `P(t_{\\text{df}} < t_{\\text{stat}})` : `2 \\cdot P(|t_{\\text{df}}| > |t_{\\text{stat}}|)`} = ${decisionData.pValue.toFixed(4)}`} />
            </>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm sm:text-base text-slate-100 font-medium leading-relaxed bg-slate-950/30 p-4 rounded-xl border border-slate-800/50 mt-4">
        <p>
          <strong className="text-emerald-300">חישוב ה-P-Value:</strong> רמת המובהקות הנצפית (P-Value) משקפת את ההסתברות הסטטיסטית לקבל תוצאה קיצונית באותה מידה או יותר, תחת ההנחה המחמירה ש-<InlineMath math="H_0" /> נכונה.
        </p>
        <p>
          {tailType === 'right' && "במבחן חד-צדדי ימני, אנו מחשבים את ההסתברות לקבל במקרה ערך סטטיסטי הגדול או שווה לערך שחישבנו, ולכן אנו מודדים את השטח מימין למדד המבחן תחת עקומת ההתפלגות."}
          {tailType === 'left' && "במבחן חד-צדדי שמאלי, אנו מחשבים את ההסתברות לקבל במקרה ערך סטטיסטי הקטן או שווה לערך שחישבנו, ולכן אנו מודדים את השטח משמאל למדד המבחן תחת עקומת ההתפלגות."}
          {tailType === 'two-tailed' && "במבחן דו-צדדי, מאחר ואנו בוחנים חריגה סימטרית משני הכיוונים, אנו מחשבים את ההסתברות לקבל ערך סטטיסטי הקיצוני יותר בערכו המוחלט מהערך שחישבנו. לכן, השטח החד-צדדי מוכפל פי שניים בכדי לשקף את ההסתברות הכוללת."}
        </p>
      </div>
      
      <p className="text-xl sm:text-2xl font-handwriting font-normal text-slate-300 text-center pt-2 mt-4" style={{ letterSpacing: '0.02em', WebkitFontSmoothing: 'antialiased' }}>
        <PenTool size={22} className="inline-block ml-2 opacity-60 text-indigo-400" /> {decisionData.pValue < alpha ? 'ההסתברות לקבל תוצאה זו מקרית הינה נמוכה ביותר, ולכן נדחה את השערת האפס.' : 'ההסתברות לקבל תוצאה זו אינה נמוכה מספיק, ולכן לא נוכל לדחות את השערת האפס.'}
      </p>

      <div className="mt-4 text-right">
        <ul className="list-disc list-inside space-y-2 text-slate-300 font-medium text-sm sm:text-base">
          <li className={decisionData.pValue < alpha ? 'text-emerald-400 font-black' : ''}>
            אם <InlineMath math="P\\text{-Value} < \\alpha" /> - נדחה את השערת האפס. {decisionData.pValue < alpha && <CheckCircle size={16} className="inline ml-1 mb-1" />}
          </li>
          <li className={decisionData.pValue >= alpha ? 'text-red-400 font-black' : ''}>
            אם <InlineMath math="P\\text{-Value} \\ge \\alpha" /> - לא נדחה את השערת האפס. {decisionData.pValue >= alpha && <CheckCircle size={16} className="inline ml-1 mb-1" />}
          </li>
        </ul>
      </div>
    </div>
  </div>

  """

content = content[:start_idx] + replacement + content[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Step 5 rationale and numeric formatting successfully applied.")
