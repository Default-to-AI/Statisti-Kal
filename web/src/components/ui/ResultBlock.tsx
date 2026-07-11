import React, { HTMLAttributes } from 'react';
import { Award } from 'lucide-react';

export interface ResultBlockProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  isReject?: boolean; // We can still support isReject for colors
}

export const ResultBlock: React.FC<ResultBlockProps> = ({ children, isReject, className = '', ...rest }) => {
    const isErrorState = isReject === false;
    
    // Colors use design tokens with Tailwind opacity modifiers.
    const borderColor = isErrorState ? 'border-[var(--color-error)]/40' : 'border-[var(--color-success)]/40';
    const borderLeftColor = isErrorState ? 'border-l-[var(--color-error)]' : 'border-l-[var(--color-success)]';
    const bgColor = isErrorState ? 'bg-[var(--color-error)]/15' : 'bg-[var(--color-success)]/15';
    const iconColor = isErrorState ? 'text-[var(--color-error)]' : 'text-[var(--color-success)]';
    const glowColor = isErrorState ? 'shadow-[0_0_20px_color-mix(in_srgb,var(--color-error)_15%,transparent)]' : 'shadow-[0_0_20px_color-mix(in_srgb,var(--color-success)_15%,transparent)]';

    return (
        <div className={`flex flex-row items-center w-full max-w-[65rem] mx-auto gap-4 py-3 sm:gap-6 ${className}`} dir="ltr" {...rest}>
            <div className="flex-1 overflow-x-auto rounded-lg shadow-sm">
                <div className={`relative border border-solid ${borderColor} border-l-4 ${borderLeftColor} ${bgColor} ${glowColor} rounded-[var(--rounded-md)] min-h-[84px] min-w-max px-6 py-4 flex flex-col items-center justify-center`}>
                    <div dir="rtl" className="w-full text-center text-lg font-bold font-sans text-[var(--color-text-primary)] leading-relaxed flex flex-col items-center justify-center space-y-3 [&_.katex-display]:!overflow-visible [&_.katex-display]:w-full [&_.katex-display]:!m-0 [&_.katex-display]:flex [&_.katex-display]:justify-center sm:text-xl md:text-2xl">
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
