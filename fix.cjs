const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/HypothesisTestingCalculator.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replacement 1: The decision banner
const target1 = `{decisionData.isReject ? (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-md font-black bg-[var(--color-accent-teal)]/15 text-[var(--color-success)] border border-[var(--color-border)] shadow-sm leading-none">
                                                <CheckCircle size={18} className="text-[var(--color-success)] shrink-0" />
                                                <span>קפיצה למסקנה: יש לדחות את </span>
                                                <span dir="ltr" className="inline-block"><InlineMath math="H_0" /></span>
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-md font-black bg-[var(--color-accent-crimson)]/15 text-[var(--color-error)] border border-[var(--color-border)] shadow-sm leading-none">
                                                <XCircle size={18} className="text-[var(--color-error)] shrink-0" />
                                                <span>קפיצה למסקנה: אין לדחות את </span>
                                                <span dir="ltr" className="inline-block"><InlineMath math="H_0" /></span>
                                            </div>
                                        )}`;
const repl1 = `<button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!showHypothesisTesting) {
                                                    setShowHypothesisTesting(true);
                                                    setTimeout(() => {
                                                        document.getElementById('step-6')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    }, 350);
                                                } else {
                                                    document.getElementById('step-6')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                }
                                            }}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm sm:text-base font-black bg-[var(--color-surface)] hover:bg-[var(--color-accent-cobalt-bg)] text-[var(--color-text-primary)] hover:text-[var(--color-accent-cobalt)] border border-[var(--color-border)] shadow-md transition-all duration-300 leading-none group"
                                        >
                                            <span>קפיצה למסקנה</span>
                                            <Target size={18} className="shrink-0 text-[var(--color-accent-cobalt)] group-hover:scale-110 transition-transform" />
                                        </button>`;
if (content.includes(target1)) {
    content = content.replace(target1, repl1);
    console.log("Replaced 1");
} else {
    console.log("Target 1 not found");
}

// Replacement 2: AnimatePresence block
const target2 = `<AnimatePresence>
                            {showHypothesisTesting && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="px-8 py-6.5"
                                >
                                    <div className="text-base flex flex-col gap-4 py-4">`;

const repl2 = `<AnimatePresence initial={false}>
                            {showHypothesisTesting && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-8 py-6.5">
                                    <div className="text-base flex flex-col gap-4 py-4">`;
if (content.includes(target2)) {
    content = content.replace(target2, repl2);
    console.log("Replaced 2");
} else {
    console.log("Target 2 not found");
}

// Replacement 3: Add id="step-6"
const target3 = `{/* Step 6: P-Value Calculation and Final Decision */}
                                                <AnimatedDetails className="group space-y-0 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg shadow-sm text-right [&_summary::-webkit-details-marker]:hidden" defaultOpen>`;
const repl3 = `{/* Step 6: P-Value Calculation and Final Decision */}
                                                <AnimatedDetails id="step-6" className="group space-y-0 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg shadow-sm text-right [&_summary::-webkit-details-marker]:hidden" defaultOpen>`;
if (content.includes(target3)) {
    content = content.replace(target3, repl3);
    console.log("Replaced 3");
} else {
    console.log("Target 3 not found");
}

// Replacement 4: Closing motion.div
const target4 = `                                </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>`;
// Need to find exactly the one for showHypothesisTesting which is followed by `{/* Power Section */}` a few lines later.
const target4_full = `                                </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Power Section */}`;

const repl4_full = `                                </div>
                                    </div>
                                </motion.div>
                            )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Power Section */}`;

if (content.includes(target4_full)) {
    content = content.replace(target4_full, repl4_full);
    console.log("Replaced 4");
} else {
    console.log("Target 4 not found");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Done");
