import re

file_path = 'src/components/HypothesisTestingCalculator.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = "{/* Step 4: Final Decision Block"
end_marker = "    </div>\n  </div>\n </div>\n </div>\n )}\n\n </div>\n ) : (\n <p className=\"text-xl"

start_idx = content.find(start_marker)
if start_idx == -1:
    print("Could not find start marker")
    exit(1)

# A more robust end index search: look for " </div>\n ) : (\n <p className=\"text-xl"
end_str = " </div>\n ) : (\n <p className=\"text-xl"
end_idx = content.find(end_str, start_idx)
if end_idx == -1:
    print("Could not find end marker")
    exit(1)

# Now we need to step back to include the closing brackets of the decisionData block
# The actual structure before end_idx is:
#  </div>
#  </div>
#  )}
#
#  </div>
#  ) : (

# Let's find the closing `)}` of the `decisionData && (` block
# We will just replace everything from `start_marker` to `end_idx` EXCEPT the `  </div>\n  ) : (\n  <p className="text-xl`
# So we just replace up to `end_idx`. We need to provide the complete replacement for the `decisionData` block, and close it with ` )}`

replacement = """{/* Step 5: P-Value Calculation */}
  <div className="space-y-3 pt-6 border-t border-slate-800/60 mt-4">
    <div className="flex items-center gap-3 font-extrabold text-indigo-400">
      <span className="w-9 h-9 rounded-full bg-indigo-100 bg-indigo-900/50 text-base font-black flex items-center justify-center border border-indigo-300 shrink-0">5</span>
      <span className="text-xl sm:text-2xl font-black">חישוב ופירוש ערך ה-P-Value</span>
    </div>
    
    <div className="bg-slate-900/60 p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-5 text-right">
      <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
        ערך ה-P-Value (רמת מובהקות נצפית) מייצג את ההסתברות הסטטיסטית לקבל תוצאה במדגם שהיא קיצונית באותה מידה או יותר מהתוצאה שהתקבלה בפועל, תחת ההנחה המחמירה שהשערת האפס נכונה לחלוטין. ככל שערך זה קטן יותר, כך הראיות האמפיריות נגד השערת האפס חזקות יותר.
      </p>
      {tailType === 'two-tailed' && (
        <div className="bg-blue-950/30 border-r-4 border-blue-500 p-3 text-sm sm:text-base text-blue-200 rounded-l-lg">
          <strong className="underline decoration-blue-500/50 underline-offset-4 decoration-2">הערה למבחן דו-צדדי:</strong> מאחר ואנו בוחנים חריגה בשני הכיוונים של ההתפלגות באופן סימטרי, ההסתברות הסטטיסטית שהתקבלה מוכפלת פי שניים בכדי לשקף את ההסתברות הכוללת לשגיאה.
        </div>
      )}
      
      {/* P-Value Math Box */}
      <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-700 shadow-lg flex flex-col gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500/30"></div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-black text-lg text-slate-200 flex items-center gap-2">
            <Activity size={20} className="text-indigo-400" />
            ערך ה-P-Value מול <InlineMath math="\\alpha" />:
          </span>
          <div className={`px-5 py-2.5 rounded-xl border-2 font-mono text-2xl tracking-wider font-black shadow-inner flex items-center justify-center ${
            decisionData.pValue < alpha 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' 
              : 'bg-red-950/40 border-red-500/30 text-red-400'
          }`}>
            {decisionData.pValue < 0.0001 ? '< 0.0001' : decisionData.pValue.toFixed(4)}
          </div>
        </div>
        <div className="w-full overflow-x-auto py-2 scrollbar-thin mt-2" dir="ltr">
          <div className="bg-slate-950/80 p-3 sm:p-4 rounded-xl border border-slate-800 text-center shadow-inner font-extrabold min-w-[280px]">
            <BlockMath math={`P\\text{-Value} = ${tailType === 'right' ? `P(${varianceKnown ? 'Z' : 't'} > ${decisionData.statObs.toFixed(3)})` : tailType === 'left' ? `P(${varianceKnown ? 'Z' : 't'} < ${decisionData.statObs.toFixed(3)})` : `2 \\cdot P(|${varianceKnown ? 'Z' : 't'}| > |${decisionData.statObs.toFixed(3)}|)`} = ${decisionData.pValue.toFixed(4)}`} />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-handwriting font-normal text-slate-300 text-center border-t border-slate-800/60 pt-5 mt-2" style={{ letterSpacing: '0.02em', WebkitFontSmoothing: 'antialiased' }}>
          <PenTool size={22} className="inline-block ml-2 opacity-60 text-indigo-400" /> {decisionData.pValue < alpha ? 'ההסתברות לקבל תוצאה זו מקרית הינה נמוכה ביותר, ולכן התוצאה מובהקת.' : 'ההסתברות לקבל תוצאה זו אינה נמוכה מספיק, ולכן התוצאה אינה מובהקת מספיק.'}
        </p>
      </div>

      {/* Logic Conditions */}
      <div className="mt-4 flex flex-col gap-3">
        <h4 className="text-slate-300 font-bold mb-1">כללי הכרעה מבוססי P-Value:</h4>
        <div className={`p-4 border-2 rounded-xl flex items-center gap-4 transition-all duration-300 ${decisionData.pValue < alpha ? 'bg-emerald-950/30 border-emerald-500/60 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)] scale-[1.01]' : 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-60'}`}>
          <div className="font-mono font-black text-lg w-28 shrink-0 text-center bg-slate-950/50 p-2 rounded-lg" dir="ltr">P &lt; &alpha;</div>
          <div className="text-sm sm:text-base font-bold">דחיית השערת האפס (התוצאה מובהקת סטטיסטית).</div>
          {decisionData.pValue < alpha && <CheckCircle size={24} className="text-emerald-400 mr-auto shrink-0" />}
        </div>
        <div className={`p-4 border-2 rounded-xl flex items-center gap-4 transition-all duration-300 ${decisionData.pValue >= alpha ? 'bg-red-950/30 border-red-500/60 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.15)] scale-[1.01]' : 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-60'}`}>
          <div className="font-mono font-black text-lg w-28 shrink-0 text-center bg-slate-950/50 p-2 rounded-lg" dir="ltr">P &ge; &alpha;</div>
          <div className="text-sm sm:text-base font-bold">אי-דחיית השערת האפס (אין מספיק ראיות אמפיריות).</div>
          {decisionData.pValue >= alpha && <CheckCircle size={24} className="text-red-400 mr-auto shrink-0" />}
        </div>
      </div>
    </div>
  </div>

  {/* Step 6: Final Decision Block */}
  {decisionData && (
  <div className={`mt-8 rounded-3xl p-6 md:p-8 border-2 shadow-lg transition-all text-right relative overflow-hidden ${
  decisionData.isReject 
  ?'bg-gradient-to-br from-emerald-950/25 to-teal-950/5 border-emerald-800' 
  : 'bg-gradient-to-br from-red-950/25 to-rose-950/5 border-red-800'
  }`}>
  {/* Top Accent Strip */}
  <div className={`absolute top-0 right-0 w-full h-1.5 ${decisionData.isReject ?'bg-emerald-500' :'bg-red-500'}`} />
  
  <h3 className="text-lg sm:text-xl font-black mb-4 flex items-center gap-3 pb-3 border-b border-dashed border-slate-800/85">
  <span className={`w-9 h-9 rounded-full shrink-0 text-base font-black flex items-center justify-center border ${decisionData.isReject ? 'bg-emerald-100 bg-emerald-900/50 border-emerald-300 text-emerald-400' : 'bg-red-100 bg-red-900/50 border-red-300 text-red-400'}`}>6</span>
  <span className={`text-xl font-black ${decisionData.isReject ? 'text-emerald-300' : 'text-red-300'}`}>
  הכרעה סטטיסטית סופית
  </span>
  <span className="text-xs font-bold text-slate-500 mr-auto font-mono">
  <InlineMath math="\\alpha" /> = {alpha} | <InlineMath math="n" /> = {n}
  </span>
  </h3>

  <div className="space-y-4">
  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 leading-relaxed text-sm sm:text-base font-bold text-slate-200">
  <div className={`text-base sm:text-lg font-black flex justify-center items-center gap-2 ${decisionData.isReject ?'text-emerald-300' :'text-red-300'}`}>
  <span>מצב: המדגם נמצא באזור {decisionData.isReject ? 'הדחייה' : 'הקבלה'}</span>
  <span className="mt-1"><InlineMath math={decisionData.isReject ? 'C' : '\\\\bar{C}'} /></span>
  </div>
  <div className="text-base sm:text-lg font-black mt-2 flex justify-center items-center gap-2">
  <span>החלטה פורמלית:</span>
  <span className="font-mono underline decoration-2 mt-1" dir="ltr"><InlineMath math={decisionData.decisionHeading} /></span>
  </div>

  {/* Zone Formal Data */}
  <div className="mt-5 p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/50 flex flex-col gap-2.5 text-center text-sm">
  <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
  <span className="text-slate-400 font-extrabold">הגדרת האזור:</span>
  <span className="font-mono text-indigo-300" dir="ltr"><InlineMath math={decisionData.isReject ? decisionData.zoneRejectionTeX : decisionData.zoneAcceptanceTeX} /></span>
  </div>
  <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
  <span className="text-slate-400 font-extrabold flex items-center">הסתברות בהינתן <span className="font-mono ml-1 mt-0.5"><InlineMath math="H_0" /></span>:</span>
  <span className="font-mono text-indigo-300" dir="ltr"><InlineMath math={decisionData.isReject ? `P(\\\\bar{X} \\\\in C \\\\mid H_0) = \\\\alpha = ${alpha}` : `P(\\\\bar{X} \\\\in \\\\bar{C} \\\\mid H_0) = 1 - \\\\alpha = ${parseFloat((1 - alpha).toFixed(4))}`} /></span>
  </div>
  <div className="text-slate-300 font-semibold mt-1">
  {decisionData.belongingExplanationText}
  </div>
  </div>

  </div>
  
  <div className="flex flex-col gap-3 mt-4">
    {/* Verbal Conclusion Box */}
    <div className={`p-6 rounded-2xl border-2 my-2 shadow-xl relative overflow-hidden transition-colors duration-500 ${decisionData.isReject ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-red-950/20 border-red-500/30'}`}>
      <span className={`absolute top-2 right-4 text-6xl opacity-20 font-serif ${decisionData.isReject ? 'text-emerald-500' : 'text-red-500'}`}>"</span>
      <p className={`text-2xl sm:text-3xl font-handwriting font-normal leading-relaxed text-center px-4 relative z-10 ${decisionData.isReject ? 'text-emerald-100' : 'text-red-100'}`} style={{ letterSpacing: '0.02em', WebkitFontSmoothing: 'antialiased' }}>
      {decisionData.verbalConclusion}
      </p>
    </div>
  </div>
 </div>
 </div>
 )}
\n"""

# Note: In the final string, I must be careful with backslashes. The replacement block has double backslashes where needed.

# Now replacing exactly
new_content = content[:start_idx] + replacement + content[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Split logic successfully applied.")
