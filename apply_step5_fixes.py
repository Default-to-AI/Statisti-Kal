import re

file_path = 'src/components/HypothesisTestingCalculator.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports
if 'PenTool' not in content:
    content = content.replace("  X\n} from 'lucide-react';", "  X,\n  PenTool,\n  Activity\n} from 'lucide-react';")

# 2. Update all "ℹ️ במילים" to use PenTool
content = content.replace('ℹ️ במילים:', '<PenTool size={22} className="inline-block ml-2 opacity-60 text-indigo-400" />')

# 3. Fix verbalConclusion creation
old_verbal = """  let verbalConclusion ='';
  const comparisonText = tailType ==='right' ? `גדולה מ-${mu0}` : tailType ==='left' ? `קטנה מ-${mu0}` : `שונה מ-${mu0}`;
  
  if (isReject) {
  verbalConclusion = `ברמת מובהקות של ${alpha}, קיימות ראיות סטטיסטיות מספקות המבוססות על המדגם כדי לדחות את השערת האפס ולקבוע כי תוחלת האוכלוסייה ${comparisonText}.`;
  } else {
  verbalConclusion = `ברמת מובהקות של ${alpha}, אין מספיק ראיות סטטיסטיות במדגם כדי לשלול את השערת האפס, ולכן לא ניתן לקבוע כי תוחלת האוכלוסייה ${comparisonText}.`;
  }"""

new_verbal = """  let verbalConclusion: React.ReactNode = null;
  const comparisonText = tailType ==='right' ? `גדולה מ-${mu0}` : tailType ==='left' ? `קטנה מ-${mu0}` : `שונה מ-${mu0}`;
  
  if (isReject) {
  verbalConclusion = <>ברמת מובהקות של {alpha}, קיימות ראיות סטטיסטיות מספקות המבוססות על המדגם כדי <span className="font-black underline text-emerald-400 decoration-emerald-500/50">לדחות</span> את השערת האפס ולקבוע כי תוחלת האוכלוסייה {comparisonText}.</>;
  } else {
  verbalConclusion = <>ברמת מובהקות של {alpha}, אין מספיק ראיות סטטיסטיות במדגם כדי לשלול את השערת האפס, ולכן <span className="font-black underline text-red-400 decoration-red-500/50">לא ניתן לדחות</span> אותה או לקבוע כי תוחלת האוכלוסייה {comparisonText}.</>;
  }"""

content = content.replace(old_verbal, new_verbal)

# 4. Restructure Step 5 block
# Find the block starting with `<div className="flex flex-col gap-3 mt-4">` and ending before `</div>\n </div>\n )}`
old_step5_block = '''  <div className="flex flex-col gap-3 mt-4">
    <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700/60 my-4 shadow-xl relative overflow-hidden">
      {/* Decorative quotes or watermark could be here */}
      <span className="absolute top-2 right-4 text-slate-700 text-6xl opacity-30 font-serif">"</span>
      <p className="text-2xl sm:text-3xl font-handwriting font-normal text-slate-200/90 leading-relaxed text-center px-4 relative z-10" style={{ letterSpacing: '0.02em', WebkitFontSmoothing: 'antialiased' }}>
      {decisionData.verbalConclusion}
      </p>
    </div>
    <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-700 mt-6 shadow-lg flex flex-col gap-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500/30"></div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-black text-lg text-slate-200 flex items-center gap-2">
          רמת המובהקות שהושגה בפועל (P-Value):
        </span>
        <div className={`px-5 py-2.5 rounded-xl border-2 font-mono text-2xl tracking-wider font-black shadow-inner flex items-center justify-center ${
          decisionData.pValue < alpha 
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' 
            : 'bg-red-950/40 border-red-500/30 text-red-400'
        }`}>
          {decisionData.pValue < 0.0001 ? '< 0.0001' : decisionData.pValue.toFixed(4)}
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-handwriting font-normal text-slate-300 text-center border-t border-slate-800/60 pt-5 mt-2" style={{ letterSpacing: '0.02em', WebkitFontSmoothing: 'antialiased' }}>
      <PenTool size={22} className="inline-block ml-2 opacity-60 text-indigo-400" /> ה-P-Value מייצג את ההסתברות לקבל תוצאה קיצונית כזו בהנחה שהשערת האפס נכונה.
      </p>
    </div>
  </div>'''

new_step5_block = '''  <div className="flex flex-col gap-3 mt-4">
    {/* P-Value Box */}
    <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-700 mt-2 shadow-lg flex flex-col gap-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500/30"></div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-black text-lg text-slate-200 flex items-center gap-2">
          <Activity size={20} className="text-indigo-400" />
          רמת המובהקות שהושגה בפועל (P-Value):
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
        <div className="bg-slate-900/80 p-3 sm:p-4 rounded-xl border border-slate-800 text-center shadow-inner font-extrabold min-w-[280px]">
          <BlockMath math={`P\\text{-Value} = ${tailType === 'right' ? `P(${statSymbol} > ${stats.stat.toFixed(3)})` : tailType === 'left' ? `P(${statSymbol} < ${stats.stat.toFixed(3)})` : `2 \\cdot P(${statSymbol} > |${stats.stat.toFixed(3)}|)`} = ${decisionData.pValue.toFixed(4)}`} />
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-handwriting font-normal text-slate-300 text-center border-t border-slate-800/60 pt-5 mt-2" style={{ letterSpacing: '0.02em', WebkitFontSmoothing: 'antialiased' }}>
      <PenTool size={22} className="inline-block ml-2 opacity-60 text-indigo-400" /> ה-P-Value מייצג את ההסתברות לקבל תוצאה קיצונית כזו בהנחה שהשערת האפס נכונה.
      </p>
    </div>

    {/* Verbal Conclusion Box */}
    <div className={`p-6 rounded-2xl border-2 my-2 shadow-xl relative overflow-hidden transition-colors duration-500 ${decisionData.isReject ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-red-950/20 border-red-500/30'}`}>
      <span className={`absolute top-2 right-4 text-6xl opacity-20 font-serif ${decisionData.isReject ? 'text-emerald-500' : 'text-red-500'}`}>"</span>
      <p className={`text-2xl sm:text-3xl font-handwriting font-normal leading-relaxed text-center px-4 relative z-10 ${decisionData.isReject ? 'text-emerald-100' : 'text-red-100'}`} style={{ letterSpacing: '0.02em', WebkitFontSmoothing: 'antialiased' }}>
      {decisionData.verbalConclusion}
      </p>
    </div>
  </div>'''

# We also need to consider that old_step5_block might have emoji already replaced by step 2 above.
# So let's replace emoji in old_step5_block as well to ensure match.
old_step5_block = old_step5_block.replace('ℹ️ במילים:', '<PenTool size={22} className="inline-block ml-2 opacity-60 text-indigo-400" />')

content = content.replace(old_step5_block, new_step5_block)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Python script updated.")
