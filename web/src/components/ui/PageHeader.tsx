import React from 'react';
import { Heading } from './Heading';

export interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({ title, description, className = '' }: PageHeaderProps) {
  return (
    <div className={`mb-12 w-full flex flex-col items-center justify-center text-center space-y-4 relative ${className}`}>
      {/* Background soft glow - Vercel/Linear style */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-2xl h-32 bg-gradient-to-r from-[var(--color-primary)]/10 via-[var(--color-accent-cobalt)]/10 to-[var(--color-primary)]/10 blur-3xl rounded-full opacity-60 pointer-events-none -z-10" />
      
      <div className="h-1.5 w-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-cobalt)] rounded-full mb-2" />
      
      <Heading
        level="page"
        align="center"
        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-text-primary)] via-[var(--color-text-primary)] to-[var(--color-primary)] drop-shadow-sm tracking-tight pb-2"
      >
        {title}
      </Heading>
      
      {description && (
        <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] font-medium max-w-2xl mx-auto mt-4 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
