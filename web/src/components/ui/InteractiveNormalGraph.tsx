import React, { useMemo } from 'react';
import { RegionType } from '../../data/testQuestions/types';

interface InteractiveNormalGraphProps {
  value: RegionType | null;
  onChange: (val: RegionType) => void;
  disabled?: boolean;
  correctRegion?: RegionType;
}

export const InteractiveNormalGraph: React.FC<InteractiveNormalGraphProps> = ({
  value,
  onChange,
  disabled,
  correctRegion,
}) => {
  // We represent the selected state internally as an array of selected parts
  const selectedParts = useMemo(() => {
    if (value === 'both') return ['left', 'right'];
    if (value === 'left') return ['left'];
    if (value === 'right') return ['right'];
    if (value === 'middle') return ['middle'];
    return [];
  }, [value]);

  const togglePart = (part: 'left' | 'middle' | 'right') => {
    if (disabled) return;
    
    let newParts = [...selectedParts];
    if (newParts.includes(part)) {
      newParts = newParts.filter(p => p !== part);
    } else {
      // If middle is selected, it can't be combined with tails (for simplicity)
      if (part === 'middle') {
        newParts = ['middle'];
      } else {
        newParts = newParts.filter(p => p !== 'middle');
        newParts.push(part);
      }
    }

    if (newParts.length === 0) onChange(null as any);
    else if (newParts.includes('left') && newParts.includes('right')) onChange('both');
    else if (newParts.includes('left')) onChange('left');
    else if (newParts.includes('right')) onChange('right');
    else if (newParts.includes('middle')) onChange('middle');
  };

  const getFillColor = (part: 'left' | 'middle' | 'right') => {
    const isSelected = selectedParts.includes(part);
    if (!isSelected) return 'var(--color-surface-raised)';
    
    if (disabled && correctRegion) {
      // If submitted, show if they got it right
      const correctParts = 
        correctRegion === 'both' ? ['left', 'right'] : 
        correctRegion === 'left' ? ['left'] : 
        correctRegion === 'right' ? ['right'] : ['middle'];
      
      const isCorrectlySelected = correctParts.includes(part);
      if (isCorrectlySelected) return 'var(--color-success)';
      return 'var(--color-error)';
    }

    // Default selection color
    return 'var(--color-accent-cobalt)';
  };

  const getOpacity = (part: 'left' | 'middle' | 'right') => {
    const isSelected = selectedParts.includes(part);
    if (!isSelected) return 0.5;
    return disabled ? 0.3 : 0.2;
  };

  return (
    <div className="w-full max-w-md mx-auto aspect-[2/1] relative select-none" dir="ltr">
      <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible drop-shadow-sm">
        <defs>
          <clipPath id="left-tail">
            <rect x="0" y="0" width="30" height="50" />
          </clipPath>
          <clipPath id="middle-body">
            <rect x="30" y="0" width="40" height="50" />
          </clipPath>
          <clipPath id="right-tail">
            <rect x="70" y="0" width="30" height="50" />
          </clipPath>
          
          {/* A decent approximation of a normal curve path */}
          <path id="curve" d="M 0 50 Q 20 49 30 40 C 40 25 45 5 50 5 C 55 5 60 25 70 40 Q 80 49 100 50 L 100 50 L 0 50 Z" />
        </defs>

        {/* Base axis */}
        <line x1="0" y1="50" x2="100" y2="50" stroke="var(--color-border)" strokeWidth="1" />
        
        {/* Left Tail */}
        <g clipPath="url(#left-tail)" 
           onClick={() => togglePart('left')}
           className={disabled ? 'cursor-default' : 'cursor-pointer hover:opacity-80 transition-opacity'}
        >
          <use href="#curve" fill={getFillColor('left')} fillOpacity={getOpacity('left')} />
          <use href="#curve" stroke="var(--color-text-secondary)" strokeWidth="0.5" fill="none" />
        </g>

        {/* Middle Body */}
        <g clipPath="url(#middle-body)"
           onClick={() => togglePart('middle')}
           className={disabled ? 'cursor-default' : 'cursor-pointer hover:opacity-80 transition-opacity'}
        >
          <use href="#curve" fill={getFillColor('middle')} fillOpacity={getOpacity('middle')} />
          <use href="#curve" stroke="var(--color-text-secondary)" strokeWidth="0.5" fill="none" />
        </g>

        {/* Right Tail */}
        <g clipPath="url(#right-tail)"
           onClick={() => togglePart('right')}
           className={disabled ? 'cursor-default' : 'cursor-pointer hover:opacity-80 transition-opacity'}
        >
          <use href="#curve" fill={getFillColor('right')} fillOpacity={getOpacity('right')} />
          <use href="#curve" stroke="var(--color-text-secondary)" strokeWidth="0.5" fill="none" />
        </g>

        {/* Dividers */}
        <line x1="30" y1="40" x2="30" y2="50" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="1 1" />
        <line x1="70" y1="40" x2="70" y2="50" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="1 1" />
        <line x1="50" y1="5" x2="50" y2="50" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="1 1" />
      </svg>
      <div className="absolute top-2 left-0 right-0 text-center text-xs text-[var(--color-text-secondary)] font-bold pointer-events-none opacity-50">
        לחצו על האזורים בגרף כדי לסמן אותם
      </div>
    </div>
  );
};
