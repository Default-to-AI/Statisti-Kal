import React from 'react';

export type QuestionType = 'multiple-choice' | 'open-text' | 'open-calc' | 'interactive-region' | 'multi-part';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'exam';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  prompt: React.ReactNode;
  topic: string;
  points: number;
  rationale?: React.ReactNode;
}

export interface MCOption {
  id: string;
  label: string;
  text?: React.ReactNode;
  latex?: string;
  correct?: boolean;
}

export interface MCQuestion extends BaseQuestion {
  type: 'multiple-choice';
  options: MCOption[];
}

export interface OpenCalcQuestion extends BaseQuestion {
  type: 'open-calc';
  correctAnswer: number;
  /** Tolerance for checking numeric equivalence. Default logic: whole number must match. */
  tolerance?: number; 
}

export interface OpenTextQuestion extends BaseQuestion {
  type: 'open-text';
  correctAnswers: string[]; // List of acceptable string answers (case-insensitive)
}

// Visual Region Selection (e.g. left tail, right tail, middle)
export type RegionType = 'left' | 'right' | 'middle' | 'both';
export interface InteractiveRegionQuestion extends BaseQuestion {
  type: 'interactive-region';
  correctRegion: RegionType;
}

// Multi-Part Scenario
export type SubQuestionType = 'multiple-choice' | 'open-calc' | 'open-text';

export interface SubQuestion {
  id: string;
  type: SubQuestionType;
  prompt: React.ReactNode;
  
  // Specific fields
  options?: MCOption[]; // For multiple choice
  correctAnswer?: number; // For open-calc
  tolerance?: number; // For open-calc
  correctAnswers?: string[]; // For open-text
  
  rationale?: React.ReactNode;
}

export interface MultiPartQuestion extends BaseQuestion {
  type: 'multi-part';
  parts: SubQuestion[];
}

export type TestQuestion = MCQuestion | OpenCalcQuestion | OpenTextQuestion | InteractiveRegionQuestion | MultiPartQuestion;
