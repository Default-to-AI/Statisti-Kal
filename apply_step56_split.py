import re

file_path = 'src/components/HypothesisTestingCalculator.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Locate the starting point of the current Final Decision Block
start_marker = "{/* Step 4: Final Decision Block (Highlighted green/red panel) - Requirement 2 & 3 */}"

# We will replace the entire block starting from `start_marker` to the end of the `showSteps` condition block
# Wait, let's find the exact block from `start_marker` down to `</div>\n </div>\n )}` 
pattern = re.compile(r'\{\/\* Step 4: Final Decision Block.*?\}\n \}\)\n \}\)\n \}\)', re.DOTALL)

# Let's do it with a safer replace by using string replace from the start marker to `  </div>\n  </div>\n  )}\n  </div>\n  </div>`
parts = content.split(start_marker)
if len(parts) < 2:
    print("Could not find start_marker")
    exit(1)

pre_content = parts[0]
post_content = parts[1]

# We want to replace up to the end of the `decisionData && (` block
# Let's find the end of the main `div` containing `decisionData && (`
# It ends right before ` ) : (` on line 2199
# Let's just find `  </div>\n  </div>\n  )}\n\n  </div>\n  ) : (\n  <p className="text-xl text-red-700 font-extrabold">`
# and split on that.

# Better yet, I will write the replacement block directly and do a direct file rewrite using robust regex.
# Actually, let's just write the exact React code to replace the whole section.

replacement = """{/* Step 5: P-Value Calculation and Interpretation */}
  {decisionData && (
  <div className="space-y-3 pt-6 border-t border-slate-800/60 mt-4">
    <div className="flex items-center gap-3 font-extrabold text-indigo-400">
      <span className="w-9 h-9 rounded-full bg-indigo-100 bg-indigo-900/50 text-base font-black flex items-center justify-center border border-indigo-300">5</span>
      <span className="text-xl sm:text-2xl font-black">חישוב ופירוש ערך ה-P-Value</span>
    </div>
    
    <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
      <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
        ערך ה-P-Value מייצג את ההסתברות המדויקת לקבל תוצאה קיצונית כפי שהתקבלה במדגם (או קיצונית ממנה), תחת ההנחה המלאה שהשערת האפס נכונה. ככל שערך זה קטן יותר, כך הראיות האמפיריות נגד השערת האפס חזקות יותר.
      </p>
      {tailType === 'two-tailed' && (
        <div className="bg-blue-950/20 border-r-4 border-blue-500 p-3 text-sm text-blue-200 rounded-l-lg">
          <strong>הערה למבחן דו-צדדי:</strong> מאחר ואנו בוחנים חריגה אפשרית בשני הכיוונים של ההתפלגות באופן סימטרי, שטח הקיצון שהתקבל מוכפל פי 2 כדי לשקף את ההסתברות הכוללת לשגיאה.
        </div>
      )}

      {/* P-Value Math Box */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700 shadow-lg flex flex-col gap-4 relative overflow-hidden mt-4">
        <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500/30"></div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-black text-lg text-slate-200 flex items-center gap-2">
            <Activity size={20} className="text-indigo-400" />
            רמת המובהקות שהושגה בפועל:
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
          <div className="bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-800 text-center shadow-inner font-extrabold min-w-[280px]">
            <BlockMath math={`P\\text{-Value} = ${tailType === 'right' ? `P(${varianceKnown ? 'Z' : 't'} > ${decisionData.statObs.toFixed(3)})` : tailType === 'left' ? `P(${varianceKnown ? 'Z' : 't'} < ${decisionData.statObs.toFixed(3)})` : `2 \\cdot P(|${varianceKnown ? 'Z' : 't'}| > |${decisionData.statObs.toFixed(3)}|)`} = ${decisionData.pValue.toFixed(4)}`} />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-handwriting font-normal text-slate-300 text-center border-t border-slate-800/60 pt-5 mt-2" style={{ letterSpacing: '0.02em', WebkitFontSmoothing: 'antialiased' }}>
          <PenTool size={22} className="inline-block ml-2 opacity-60 text-indigo-400" /> {decisionData.pValue < alpha ? 'ההסתברות לקבל תוצאה זו מקרית הינה נמוכה ביותר, ולכן התוצאה מובהקת.' : 'ההסתברות לקבל תוצאה זו אינה נמוכה מספיק, ולכן התוצאה אינה מובהקת מספיק.'}
        </p>
      </div>

      {/* Logic Conditions */}
      <div className="mt-6 flex flex-col gap-2">
        <h4 className="text-slate-300 font-bold mb-1">כללי הכרעה מבוססי P-Value:</h4>
        <div className={`p-3 border rounded-lg flex items-center gap-3 transition-colors ${decisionData.pValue < alpha ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
          <div className="font-mono font-bold w-24 shrink-0 text-left" dir="ltr">P &lt; &alpha;</div>
          <div className="text-sm font-semibold">דחיית השערת האפס (התוצאה מובהקת סטטיסטית).</div>
          {decisionData.pValue < alpha && <CheckCircle size={18} className="text-emerald-400 mr-auto" />}
        </div>
        <div className={`p-3 border rounded-lg flex items-center gap-3 transition-colors ${decisionData.pValue >= alpha ? 'bg-red-950/30 border-red-500/50 text-red-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
          <div className="font-mono font-bold w-24 shrink-0 text-left" dir="ltr">P &ge; &alpha;</div>
          <div className="text-sm font-semibold">אי-דחיית השערת האפס (אין מספיק ראיות אמפיריות).</div>
          {decisionData.pValue >= alpha && <CheckCircle size={18} className="text-red-400 mr-auto" />}
        </div>
      </div>
    </div>
  </div>
  )}

  {/* Step 6: Final Decision Block */}
  {decisionData && (
  <div className="space-y-3 pt-6 border-t border-slate-800/60 mt-4">
    <div className="flex items-center gap-3 font-extrabold text-indigo-400">
      <span className="w-9 h-9 rounded-full bg-indigo-100 bg-indigo-900/50 text-base font-black flex items-center justify-center border border-indigo-300">6</span>
      <span className="text-xl sm:text-2xl font-black">הכרעה סטטיסטית סופית</span>
    </div>

    <div className={`mt-4 rounded-3xl p-6 md:p-8 border-2 shadow-lg transition-all text-right relative overflow-hidden ${
    decisionData.isReject 
    ?'bg-gradient-to-br from-emerald-950/25 to-teal-950/5 border-emerald-800' 
    : 'bg-gradient-to-br from-red-950/25 to-rose-950/5 border-red-800'
    }`}>
    {/* Top Accent Strip */}
    <div className={`absolute top-0 right-0 w-full h-1.5 ${decisionData.isReject ?'bg-emerald-500' :'bg-red-500'}`} />
    
    <div className="space-y-4">
    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 leading-relaxed text-sm sm:text-base font-bold text-slate-200">
    <div className={`text-base sm:text-lg font-black flex justify-center items-center gap-2 ${decisionData.isReject ?'text-emerald-300' :'text-red-300'}`}>
    {decisionData.isReject ? <CheckCircle size={22} className="animate-bounce" /> : <XCircle size={22} className="animate-pulse" />}
    <span>מצב: המדגם נמצא באזור {decisionData.isReject ? 'הדחייה' : 'הקבלה'}</span>
    <span className="mt-1"><InlineMath math={decisionData.isReject ? 'C' : '\\bar{C}'} /></span>
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
    <span className="text-slate-400 font-extrabold flex items-center">הסתברות בהינתן <span className="font-mono ml-1 mt-0.5"><InlineMath math="H_0\\ " /></span>:</span>
    <span className="font-mono text-indigo-300" dir="ltr"><InlineMath math={decisionData.isReject ? `P(\\bar{X} \\in C \\mid H_0) = \\alpha = ${alpha}` : `P(\\bar{X} \\in \\bar{C} \\mid H_0) = 1 - \\alpha = ${parseFloat((1 - alpha).toFixed(4))}`} /></span>
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
   )}"""

# Replace in file using regex boundaries
start_idx = content.find('{/* Step 4: Final Decision Block')
if start_idx == -1:
    print("Could not find start index")
    exit(1)

# Find the matching closing brackets for the block
end_str = "   </div>\n   </div>\n   )}\n\n  </div>\n  ) : (\n  <p"
end_idx = content.find(end_str, start_idx)
if end_idx == -1:
    # Alternative ending search
    end_str_alt = "    </div>\n  </div>\n  </div>\n  )\n  )\n  ) : ("
    end_idx = content.find("  </div>\n  ) : (\n  <p className=\"text-xl", start_idx)
    if end_idx == -1:
        print("Could not find end index")
        # Let's write a targeted regex
        import sys
        sys.exit(1)

new_content = content[:start_idx] + replacement + content[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Python script updated.")
