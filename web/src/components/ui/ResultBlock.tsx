import React, { HTMLAttributes } from 'react';
import { Award } from 'lucide-react';

export interface ResultBlockProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  isReject?: boolean; // We can still support isReject for colors
}

export const ResultBlock: React.FC<ResultBlockProps> = ({ children, isReject, className = '', ...rest }) => {
    const isErrorState = isReject === false;
    
    // Explicit rgba values are used for translucent colors because Tailwind opacity modifiers (/15, /40)
    // often fail to parse when the CSS variable is a hex code (e.g., #3ba98d).
    // success = #3ba98d (rgba(59, 169, 141))
    // error = #d95b5b (rgba(217, 91, 91))
    
    const borderColor = isErrorState ? 'border-[rgba(217,91,91,0.4)]' : 'border-[rgba(59,169,141,0.4)]';
    const borderLeftColor = isErrorState ? 'border-l-[var(--color-error)]' : 'border-l-[var(--color-success)]';
    const bgColor = isErrorState ? 'bg-[rgba(217,91,91,0.15)]' : 'bg-[rgba(59,169,141,0.15)]';
    const iconColor = isErrorState ? 'text-[var(--color-error)]' : 'text-[var(--color-success)]';
    const glowColor = isErrorState ? 'shadow-[0_0_20px_rgba(217,91,91,0.15)]' : 'shadow-[0_0_20px_rgba(59,169,141,0.15)]';

    return (
        <div className={`flex flex-row items-center w-full max-w-[65rem] mx-auto gap-4 sm:gap-6 py-1 my-0 ${className}`} dir="ltr" {...rest}>
            <div className="flex-1 overflow-x-auto scrollbar-thin rounded-[var(--rounded-lg)] py-2">
                <div className={`relative border border-solid ${borderColor} border-l-4 ${borderLeftColor} rounded-[var(--rounded-lg)] ${bgColor} ${glowColor} px-4 py-3 sm:px-5 sm:py-4 flex flex-col items-center justify-center min-h-0 min-w-max mx-1`}>
                    <div dir="rtl" className="w-full text-center text-[var(--color-text-primary)] text-sm sm:text-base leading-relaxed flex flex-col items-center justify-center space-y-3 font-bold [&_.katex-display]:!overflow-visible [&_.katex-display]:w-full [&_.katex-display]:!m-0 [&_.katex-display]:flex [&_.katex-display]:justify-center">
                        {children}
                    </div>
                </div>
            </div>
            <div className={`shrink-0 w-10 sm:w-12 flex justify-center ${iconColor}`}>
                <Award size={36} strokeWidth={1.2} />
            </div>
        </div>
    );
};
