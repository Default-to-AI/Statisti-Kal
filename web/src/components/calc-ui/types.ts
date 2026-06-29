export type CalcMode = 'forward' | 'inverse' | 'table' | 'hypothesis' | 'formula-sheet';
export type CalcType = 'below' | 'above' | 'between' | 'outside' | 'conditional';
export type CalculatorMode = Extract<CalcMode, 'forward' | 'inverse'>;
export type CondType = 'below' | 'above' | 'between';

