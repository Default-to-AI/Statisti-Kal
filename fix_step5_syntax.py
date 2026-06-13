import re

file_path = 'src/components/HypothesisTestingCalculator.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the graph header to include P-Value
graph_header = """  <span className={`flex items-center gap-1.5 font-black transition-all select-none ${calculatePower ? 'text-emerald-400' : 'hidden opacity-0'}`}>
 <span className="w-3 h-3 rounded-none bg-emerald-500/30 border border-emerald-500 inline-block" />
 1-β
 </span>"""

graph_header_repl = """  <span className={`flex items-center gap-1.5 font-black transition-all select-none ${calculatePower ? 'text-emerald-400' : 'hidden opacity-0'}`}>
 <span className="w-3 h-3 rounded-none bg-emerald-500/30 border border-emerald-500 inline-block" />
 1-β
 </span>
 <span className="flex items-center gap-1.5 font-black text-indigo-400 select-none border-r border-slate-700 pr-4 mr-2">
 P-Value: {decisionData.pValue < 0.0001 ? '< 0.0001' : decisionData.pValue.toFixed(4)}
 </span>"""

content = content.replace(graph_header, graph_header_repl)


# Fix Step 5 Layout and Syntax
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
      <p className="text-sm sm:text-base text-slate-100 font-extrabold mb-2 leading-relaxed">
        ערך ה-P-Value (רמת מובהקות נצפית) מייצג את ההסתברות הסטטיסטית לקבל תוצאה במדגם שהיא קיצונית באותה מידה או יותר מהתוצאה שהתקבלה בפועל, תחת ההנחה המחמירה שהשערת האפס נכונה לחלוטין.
      </p>

      {tailType === 'two-tailed' && (
        <p className="text-sm sm:text-base text-blue-300 font-bold leading-relaxed mt-2">
          <span className="underline decoration-blue-500/50 underline-offset-4 decoration-2">הערה למבחן דו-צדדי:</span> מאחר ואנו בוחנים חריגה בשני הכיוונים של ההתפלגות באופן סימטרי, ההסתברות הסטטיסטית שהתקבלה מוכפלת פי שניים.
        </p>
      )}
      
      <div className="w-full overflow-x-auto py-2 scrollbar-thin mt-2" dir="ltr">
        <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border-2 border-slate-800 space-y-3 text-lg sm:text-xl md:text-2xl text-center shadow-inner font-extrabold min-w-[280px]">
          {varianceKnown ? (
            <>
              <BlockMath math={`Z_{stat} = \\frac{\\bar{X} - \\mu_0}{SE} = ${decisionData.statObs.toFixed(4)}`} />
              <BlockMath math={`P\\text{-Value} = ${tailType === 'right' ? `P(Z > Z_{stat})` : tailType === 'left' ? `P(Z < Z_{stat})` : `2 \\cdot P(|Z| > |Z_{stat}|)`} = ${decisionData.pValue.toFixed(4)}`} />
            </>
          ) : (
            <>
              <BlockMath math={`t_{stat} = \\frac{\\bar{X} - \\mu_0}{SE} = ${decisionData.statObs.toFixed(4)}`} />
              <BlockMath math={`P\\text{-Value} = ${tailType === 'right' ? `P(t_{df} > t_{stat})` : tailType === 'left' ? `P(t_{df} < t_{stat})` : `2 \\cdot P(|t_{df}| > |t_{stat}|)`} = ${decisionData.pValue.toFixed(4)}`} />
            </>
          )}
        </div>
      </div>
      
      <p className="text-xl sm:text-2xl font-handwriting font-normal text-slate-300 text-center pt-2 mt-2" style={{ letterSpacing: '0.02em', WebkitFontSmoothing: 'antialiased' }}>
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

print("Step 5 syntax fix successfully applied.")
