import re

file_path = 'src/components/HypothesisTestingCalculator.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

h0_new = """ {/* H0 Card */}
 <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col h-full text-right">
 <div className="flex items-center gap-2 text-blue-400 font-black justify-start mb-2">
 <span className="text-sm font-black px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 font-mono">H0</span>
 <span className="text-lg sm:text-xl font-black">השערת האפס</span>
 </div>
 <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal mb-4">
 מניחה שאין השפעה, קשר או שינוי חדש במערכת, וכי המצב הקיים נותר <span className="font-bold underline">ללא שינוי</span>.
 הפרמטר הנבדק <span className="font-bold">שווה בדיוק</span> לערך הבסיס שהוגדר.
 </p>
 <div className="mt-auto bg-slate-950/80 py-4 px-2 rounded-xl border border-blue-500/40 text-center text-xl sm:text-2xl text-blue-100 shadow-inner" dir="ltr">
 <BlockMath math={`H_0: \\mu = ${mu0}`} />
 </div>
 <p className="text-xs sm:text-sm text-slate-400 font-normal text-center mt-3">
 \u2139\ufe0f במילים: ההנחה כרגע היא כי ממוצע האוכלוסיה (<InlineMath math="\\mu" />) שווה ל-{mu0}.
 </p>
 </div>"""

h1_new = """ {/* H1 Card */}
 <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col h-full text-right">
 <div className="flex items-center gap-2 text-amber-400 font-black justify-start mb-2">
 <span className="text-sm font-black px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 font-mono">H1</span>
 <span className="text-lg sm:text-xl font-black">השערת המחקר</span>
 </div>
 <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal mb-4">
 מייצגת את שאלת המחקר והשינוי שהחוקר מנסה להוכיח. כיוון הניסוח נקבע בהתאם לכיוון המבחן שהוגדר.
 </p>
 <div className="mt-auto bg-slate-950/80 py-4 px-2 rounded-xl border border-amber-500/40 text-center text-xl sm:text-2xl text-amber-100 shadow-inner" dir="ltr">
 {tailType === 'right' ? (
 <BlockMath math={`H_1: \\mu > ${mu0}`} />
 ) : tailType === 'left' ? (
 <BlockMath math={`H_1: \\mu < ${mu0}`} />
 ) : (
 <BlockMath math={`H_1: \\mu \\neq ${mu0}`} />
 )}
 </div>
 <p className="text-xs sm:text-sm text-slate-400 font-normal text-center mt-3">
 \u270d\ufe0f ניסוח מילולי: תוחלת האוכלוסייה (<InlineMath math="\\mu" />) {' '}
 {tailType === 'right' ? (
 <span className="font-bold">גדולה מ-{mu0} (מבחן חד-צדדי ימני).</span>
 ) : tailType === 'left' ? (
 <span className="font-bold">קטנה מ-{mu0} (מבחן חד-צדדי שמאלי).</span>
 ) : (
 <span className="font-bold">שונה מ-{mu0} (מבחן דו-צדדי).</span>
 )}
 </p>
 </div>"""

new_grid = f'<div className="grid grid-cols-1 md:grid-cols-2 gap-4">\n{h0_new}\n\n{h1_new}\n </div>'
replacement_str = new_grid + '\n </div>\n </div>\n </div>'

content = re.sub(r'<div className="grid grid-cols-1 md:grid-cols-2 gap-4">.*?</div>\n </div>\n </div>\n </div>', lambda m: replacement_str, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
