const fs = require('fs');
const path = 'src/components/HypothesisTestingCalculator.tsx';
let content = fs.readFileSync(path, 'utf8');

const rightColWrapperStart = '<div className="space-y-8 w-full min-w-0">';
const accordionComment = '{/* Solutions Steps Accordion / Panel */}';
const leftColComment = '{/* LEFT Column - Info & Explanations Panel */}';
const mainGridEndStr = '</div>\n  </div>\n  );\n}';

// We want to extract Accordion
const accStart = content.indexOf(accordionComment);
const leftStart = content.indexOf(leftColComment);

// Find the last </div> before leftStart (this is the end of the RIGHT column)
const rightColEnd = content.lastIndexOf('</div>', leftStart - 1);

// Accordion text
const accordionText = content.substring(accStart, rightColEnd).trim();

// Remove Accordion text from content
let newContent = content.substring(0, accStart) + '\n  ' + content.substring(rightColEnd);

// Find the end of the Main Grid Layout in newContent
const newGridEnd = newContent.lastIndexOf(mainGridEndStr);

// Inject Accordion text before the end of the Main Grid Layout
newContent = newContent.substring(0, newGridEnd) + 
  '\n\n  {/* Solutions Steps Accordion / Panel - Full Width Row */}\n' +
  '  <div className="col-span-1 lg:col-span-2 w-full mt-4">\n' +
  '    ' + accordionText + '\n' +
  '  </div>\n' +
  newContent.substring(newGridEnd);

fs.writeFileSync(path, newContent, 'utf8');
console.log('Done!');
