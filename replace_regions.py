import re

file_path = 'src/components/HypothesisTestingCalculator.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the wrapper class
content = content.replace('<div className="space-y-3 pr-2">', '<div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-2">')

# Replace the rejection region wrapper class
content = content.replace('<div className="space-y-1">\n <div className="flex items-start gap-2">', 
                          '<div className="space-y-1 bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 flex flex-col h-full">\n <div className="flex items-start gap-2">')

# Replace the acceptance region wrapper class
content = content.replace('<div className="space-y-1 pt-3 border-t border-dashed border-slate-800">\n <div className="flex items-start gap-2">', 
                          '<div className="space-y-1 bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 flex flex-col h-full">\n <div className="flex items-start gap-2">')

# Add mt-auto to the w-full overflow-x-auto wrappers
content = content.replace('<div className="w-full overflow-x-auto py-2 scrollbar-thin" dir="ltr">',
                          '<div className="w-full overflow-x-auto py-2 scrollbar-thin mt-auto" dir="ltr">')

# Increase font size for emerald blocks
content = content.replace('bg-emerald-950/20 p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/30 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.1)] space-y-3 text-sm sm:text-base md:text-lg font-extrabold min-w-[280px]',
                          'bg-emerald-950/20 p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/30 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.1)] space-y-3 text-lg sm:text-xl md:text-2xl text-center font-extrabold min-w-[280px]')

# Increase font size for red blocks
content = content.replace('bg-red-950/20 p-4 sm:p-5 rounded-2xl border-2 border-red-500/30 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.1)] space-y-3 text-sm sm:text-base md:text-lg font-extrabold min-w-[280px]',
                          'bg-red-950/20 p-4 sm:p-5 rounded-2xl border-2 border-red-500/30 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.1)] space-y-3 text-lg sm:text-xl md:text-2xl text-center font-extrabold min-w-[280px]')

# Fix the translation string - first replace the classes
content = content.replace('<p className="text-xs text-slate-400 font-bold italic mr-5">',
                          '<p className="text-xs text-slate-400 font-normal italic mt-2 text-center">')

# There are typos in some text-slate-404 etc from earlier replacing maybe, fix them if they exist
content = content.replace('<p className="text-xs text-slate-404 font-bold italic mr-5">',
                          '<p className="text-xs text-slate-400 font-normal italic mt-2 text-center">')

# Replace the asterisk text to info emoji
# Need to use regex to capture the inner text between the asterisks
content = re.sub(r'\*תרגום למילים: (.*?)\*', lambda m: '\u2139\ufe0f במילים: ' + m.group(1), content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
