onst fs = require('fs');
const path = 'src/components/HypothesisTestingCalculator.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace step numbers 1, 2, 3 to match 4-6
// They currently have: bg-[var(--color-accent-brass)]/20 text-[var(--color-accent-brass)] text-base font-black flex items-center justify-center border border-[var(--color-accent-brass)]/50
// We need to change to: bg-[var(--color-accent-cobalt-bg)] bg-[var(--color-accent-brass)]/20 text-[var(--color-accent-brass)] text-base font-black flex items-center justify-center border border-[var(--color-accent-brass)]/50 shrink-0
const oldClass = 'bg-[var(--color-accent-brass)]/20 text-[var(--color-accent-brass)] text-base font-black flex items-center justify-center border border-[var(--color-accent-brass)]/50';
const newClass = 'bg-[var(--color-accent-cobalt-bg)] bg-[var(--color-accent-brass)]/20 text-[var(--color-accent-brass)] text-base font-black flex items-center justify-center border border-[var(--color-accent-brass)]/50 shrink-0';

content = content.replace(new RegExp(oldClass.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), newClass);

// Replace Calculator icon
content = content.replace(
    '<Calculator className="text-[var(--color-accent-cobalt)]" size={24} />',
    '<div className="bg-[var(--color-accent-cobalt-bg)]/20 p-2 rounded-lg text-[var(--color-accent-cobalt)]"><Calculator size={24} /></div>'
);

// Replace Sliders icons
content = content.replace(
    '<Sliders size={20} className="text-[var(--color-accent-cobalt)]" />',
    '<div className="bg-[var(--color-accent-cobalt-bg)]/20 p-2 rounded-lg text-[var(--color-accent-cobalt)]"><Sliders size={20} /></div>'
);
content = content.replace(
    '<Sliders size={14} className="text-[var(--color-accent-cobalt)]" />',
    '<div className="bg-[var(--color-accent-cobalt-bg)]/20 p-1.5 rounded-md text-[var(--color-accent-cobalt)]"><Sliders size={14} /></div>'
);

fs.writeFileSync(path, content);
console.log("Updated icons successfully.");
