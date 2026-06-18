const fs = require('fs');
const path = 'src/components/HypothesisTestingCalculator.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace details tags
content = content.replace(/<details/g, '<AnimatedDetails');
content = content.replace(/<\/details>/g, '</AnimatedDetails>');

// Replace open attribute to defaultOpen
content = content.replace(/<AnimatedDetails([^>]+)\sopen>/g, '<AnimatedDetails$1 defaultOpen>');
content = content.replace(/<AnimatedDetails([^>]+)\sopen\s+>/g, '<AnimatedDetails$1 defaultOpen>');

// Replace group-open with group-[.is-open]
content = content.replace(/group-open:/g, 'group-[.is-open]:');

// Add import if not exists
const importMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['\"]\.?\/ui['\"]/);
if (importMatch && !importMatch[1].includes('AnimatedDetails')) {
    const newImport = importMatch[0].replace('{', '{ AnimatedDetails,');
    content = content.replace(importMatch[0], newImport);
} else if (!importMatch) {
    // If we import from './ui/CustomComponents'
    const ccMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['\"]\.?\/ui\/CustomComponents['\"]/);
    if (ccMatch && !ccMatch[1].includes('AnimatedDetails')) {
        const newImport = ccMatch[0].replace('{', '{ AnimatedDetails,');
        content = content.replace(ccMatch[0], newImport);
    }
}

fs.writeFileSync(path, content);
console.log('Update complete');
