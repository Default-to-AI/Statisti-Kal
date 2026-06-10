const fs = require('fs');
const path = 'src/components/HypothesisTestingCalculator.tsx';
let content = fs.readFileSync(path, 'utf8');

const accStartStr = '{/* Solutions Steps Accordion / Panel */}';
const leftColStr = '{/* LEFT Column - Info & Explanations Panel */}';

const accStart = content.indexOf(accStartStr);
const leftColStart = content.indexOf(leftColStr);

if (accStart !== -1 && leftColStart !== -1) {
  // We need to find the `</div>` that precedes leftColStart.
  // It's the closing div of the RIGHT column.
  const endOfRightCol = content.lastIndexOf('</div>', leftColStart);
  
  // The content of the accordion is from accStart up to endOfRightCol (exclusive).
  const accordionContent = content.substring(accStart, endOfRightCol).trim();
  
  // Now remove the accordion from the file
  let newContent = content.substring(0, accStart) + '\n  ' + content.substring(endOfRightCol);
  
  // Now we need to insert the accordion at the end of the grid.
  // The grid ends right before:
  //  </div>
  //  </div>
  //  );
  // }
  
  const endOfFileContent = ' </div>\n </div>\n );\n}';
  const insertAt = newContent.lastIndexOf(' </div>\n </div>\n );\n}');
  
  if (insertAt !== -1) {
    newContent = newContent.substring(0, insertAt) + 
      '\n  {/* Solutions Steps Accordion / Panel - Full Width Row */}\n' +
      '  <div className="col-span-1 lg:col-span-2 w-full mt-4">\n' +
      '    ' + accordionContent + '\n' +
      '  </div>\n\n' +
      newContent.substring(insertAt);
      
    fs.writeFileSync(path, newContent, 'utf8');
    console.log('Successfully moved the accordion!');
  } else {
    // If the exact string isn't found, find the last `);`
    const lastReturn = newContent.lastIndexOf(');');
    const lastDivs = newContent.lastIndexOf('</div>', lastReturn);
    const lastLastDivs = newContent.lastIndexOf('</div>', lastDivs - 1);
    
    newContent = newContent.substring(0, lastLastDivs) + 
      '\n  {/* Solutions Steps Accordion / Panel - Full Width Row */}\n' +
      '  <div className="col-span-1 lg:col-span-2 w-full mt-4">\n' +
      '    ' + accordionContent + '\n' +
      '  </div>\n\n' +
      newContent.substring(lastLastDivs);
      
    fs.writeFileSync(path, newContent, 'utf8');
    console.log('Successfully moved the accordion (fallback injection)!');
  }
} else {
  console.log('Indices not found!');
}
