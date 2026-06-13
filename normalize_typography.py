import re

file_path = 'src/components/HypothesisTestingCalculator.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update subtitle paragraphs (the ones that currently use text-slate-50 font-bold)
content = content.replace('"text-base sm:text-lg text-slate-50 font-bold"', '"text-lg sm:text-xl text-slate-50 font-bold mb-2"')

# 2. Fix the specific small paragraphs in Rejection Region (Step 3).
content = content.replace('<p className="text-xs sm:text-sm text-slate-200 font-extrabold leading-relaxed">', 
                          '<p className="text-sm sm:text-base text-slate-200 font-extrabold leading-relaxed">')
# And the other ones like text-slate-205 (typo)
content = content.replace('text-xs sm:text-sm text-slate-205 text-slate-200 font-extrabold', 'text-sm sm:text-base text-slate-200 font-extrabold')
content = content.replace('text-xs sm:text-sm text-slate-205', 'text-sm sm:text-base text-slate-200')

# 3. Update the text-xs text-slate-400 font-normal italic in Step 3
content = content.replace('<p className="text-xs text-slate-400 font-normal italic mt-2 text-center">',
                          '<p className="text-sm sm:text-base text-slate-400 font-normal italic mt-3 text-center">')

# 4. Update the text-sm sm:text-sm text-slate-400 font-normal text-center mt-3 in Step 1
content = content.replace('<p className="text-sm sm:text-sm text-slate-400 font-normal text-center mt-3">',
                          '<p className="text-sm sm:text-base text-slate-400 font-normal italic mt-3 text-center">')

# 5. Fix mathematical symbols in normal text to use InlineMath (Step 3 and maybe others).
content = content.replace('גודל 1-α.', 'גודל <InlineMath math="1-\\\\alpha" />.')
content = content.replace('ברמת מובהקות α.', 'ברמת מובהקות <InlineMath math="\\\\alpha" />.')
content = content.replace('בגודל α.', 'בגודל <InlineMath math="\\\\alpha" />.')
content = content.replace('בגודל α בהתפלגות t.', 'בגודל <InlineMath math="\\\\alpha" /> בהתפלגות <InlineMath math="t" />.')
content = content.replace('(α/2 בכל קצה)', '(<InlineMath math="\\\\alpha/2" /> בכל קצה)')

# Fix typo from earlier replace if any
content = content.replace('text-slate-205 text-slate-200', 'text-slate-200')
content = content.replace('text-slate-205', 'text-slate-200')
content = content.replace('text-slate-404', 'text-slate-400')

# Fix Step 1 card descriptions
content = content.replace('<p className="text-sm sm:text-sm text-slate-200 leading-relaxed font-normal mb-4">',
                          '<p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal mb-4">')

# Fix math containers in Step 2, 3, 4, 5
content = content.replace('text-sm sm:text-base md:text-lg shadow-inner font-extrabold min-w-[280px]',
                          'text-lg sm:text-xl md:text-2xl text-center shadow-inner font-extrabold min-w-[280px]')

# And for Step 1 where we manually changed it:
content = content.replace('text-2xl sm:text-2xl text-amber-100 shadow-inner', 'text-lg sm:text-xl md:text-2xl text-amber-100 shadow-inner')
content = content.replace('text-2xl sm:text-2xl text-blue-100 shadow-inner', 'text-lg sm:text-xl md:text-2xl text-blue-100 shadow-inner')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
