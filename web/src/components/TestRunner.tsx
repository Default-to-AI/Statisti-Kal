import React, { useState, useMemo } from 'react';
import { InlineMath } from 'react-katex';
import { Heading, Card, InsightBlock, ResultBlock, InputGroup, Badge, Button, InteractiveNormalGraph } from './ui';
import { CheckCircle2, XCircle, ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';
import { TestQuestion, MCOption, RegionType } from '../data/testQuestions';

function normalizeString(str: string) {
  return str.trim().replace(/\s+/g, ' ');
}

const hebrewLetters = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'יא', 'יב'];

function checkCalcAnswer(answerStr: string, correct: number, tolerance: number = 0.5): boolean {
  const numericAnswer = parseFloat(answerStr);
  if (isNaN(numericAnswer)) return false;
  return Math.abs(numericAnswer - correct) <= tolerance;
}

function evaluateQuestion(q: TestQuestion, answerData: any): { isCorrect: boolean; points: number; subScores?: Record<string, boolean> } {
  if (!answerData) return { isCorrect: false, points: 0 };
  
  if (q.type === 'interactive-region') {
    const isCorrect = answerData === q.correctRegion;
    return { isCorrect, points: isCorrect ? q.points : 0 };
  }
  
  if (q.type === 'multi-part') {
    const subScores: Record<string, boolean> = {};
    let correctCount = 0;
    for (const p of q.parts) {
      const ans = answerData[p.id] || '';
      let pCorrect = false;
      if (p.type === 'multiple-choice') {
        pCorrect = p.options?.find(o => o.correct)?.id === ans;
      } else if (p.type === 'open-calc') {
        pCorrect = checkCalcAnswer(ans, p.correctAnswer!, p.tolerance);
      } else if (p.type === 'open-text') {
        pCorrect = p.correctAnswers!.some(ca => normalizeString(ca) === normalizeString(ans));
      }
      subScores[p.id] = pCorrect;
      if (pCorrect) correctCount++;
    }
    const isCorrect = correctCount === q.parts.length;
    const points = (correctCount / q.parts.length) * q.points;
    return { isCorrect, points, subScores };
  }

  // Basic types
  if (typeof answerData !== 'string') return { isCorrect: false, points: 0 };

  if (q.type === 'multiple-choice') {
    const correctOption = q.options.find((o: MCOption) => o.correct);
    const isCorrect = correctOption?.id === answerData;
    return { isCorrect, points: isCorrect ? q.points : 0 };
  } else if (q.type === 'open-calc') {
    const isCorrect = checkCalcAnswer(answerData, q.correctAnswer, q.tolerance);
    return { isCorrect, points: isCorrect ? q.points : 0 };
  } else if (q.type === 'open-text') {
    const isCorrect = q.correctAnswers.some(ca => normalizeString(ca) === normalizeString(answerData));
    return { isCorrect, points: isCorrect ? q.points : 0 };
  }
  
  return { isCorrect: false, points: 0 };
}

export interface TestRunnerProps {
  difficulty: 'easy' | 'medium' | 'hard' | 'exam';
  questions: TestQuestion[];
  onBack: () => void;
}

export const TestRunner: React.FC<TestRunnerProps> = ({ difficulty, questions, onBack }) => {
  // answers stores string for basic types, RegionType for interactive, or Record<string, string> for multi-part
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentErrorIdx, setCurrentErrorIdx] = useState(0);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const totalPossiblePoints = useMemo(() => questions.reduce((acc, q) => acc + q.points, 0), [questions]);

  const { results, totalParts, correctParts } = useMemo(() => {
    let earned = 0;
    let tParts = 0;
    let cParts = 0;
    const itemized: Record<string, boolean> = {};
    const multiSubScores: Record<string, Record<string, boolean>> = {};
    
    for (const q of questions) {
      const { isCorrect, points, subScores } = evaluateQuestion(q, answers[q.id]);
      earned += points;
      itemized[q.id] = isCorrect;
      if (subScores && 'parts' in q) {
        multiSubScores[q.id] = subScores;
        tParts += q.parts.length;
        cParts += Object.values(subScores).filter(Boolean).length;
      } else {
        tParts += 1;
        cParts += isCorrect ? 1 : 0;
      }
    }
    return { results: { earned, itemized, multiSubScores }, totalParts: tParts, correctParts: cParts };
  }, [answers, questions]);

  const errorItems = useMemo(() => {
    if (!isSubmitted) return [];
    const errors: { qId: string, pId?: string }[] = [];
    for (const q of questions) {
      if (q.type === 'multi-part') {
        const subScores = results.multiSubScores[q.id];
        if (subScores) {
          for (const p of q.parts) {
            if (!subScores[p.id]) errors.push({ qId: q.id, pId: p.id });
          }
        }
      } else {
        if (!results.itemized[q.id]) errors.push({ qId: q.id });
      }
    }
    return errors;
  }, [isSubmitted, questions, results]);

  const scrollToError = (idx: number) => {
    if (errorItems.length === 0) return;
    const err = errorItems[idx];
    const domId = err.pId ? `question-${err.qId}-part-${err.pId}` : `question-${err.qId}`;
    const el = document.getElementById(domId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setCurrentErrorIdx(idx);
      setHighlightedId(domId);
      setTimeout(() => setHighlightedId(null), 2500);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setAnswers({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scorePercentage = totalPossiblePoints > 0 ? Math.round((results.earned / totalPossiblePoints) * 100) : 0;

  const levelLabels: Record<TestRunnerProps['difficulty'], string> = { easy: 'קלה', medium: 'בינונית', hard: 'קשה', exam: 'מסכם (סימולציה)' };

  const updateAnswer = (qId: string, val: any) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const updateMultiPartAnswer = (qId: string, pId: string, val: string) => {
    if (isSubmitted) return;
    setAnswers(prev => {
      const current = prev[qId] || {};
      return { ...prev, [qId]: { ...current, [pId]: val } };
    });
  };

  return (
    <div>
      <div className="mb-8 mt-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-[var(--color-text-secondary)] flex items-center gap-2 pr-0 hover:bg-transparent hover:text-[var(--color-primary)] mb-2"
        >
          <ArrowRight size={18} /> חזרה לרמות הקושי
        </Button>
        <Heading level="page" withAccentBar accent="brass" className="text-center">
          מבחן רמה {levelLabels[difficulty]}
        </Heading>
      </div>

      <div className="mx-auto w-full max-w-[70rem] space-y-8 pb-12 px-4 sm:px-6">
        {questions.map((q, idx) => {
          const answer = answers[q.id];
          const isCorrect = results.itemized[q.id];

          return (
            <Card 
              id={`question-${q.id}`} 
              key={q.id} 
              variant="default" 
              className={`w-full relative overflow-hidden scroll-m-24 transition-all duration-700 ${
                highlightedId === `question-${q.id}`
                  ? 'ring-2 ring-[var(--color-error)] shadow-lg shadow-[var(--color-error)]/20'
                  : ''
              }`}
            >
              <div className="border-b border-[var(--color-border)] px-4 py-3 sm:px-5 flex justify-between items-center bg-[var(--color-surface-raised)]">
                <span className="text-sm font-bold text-[var(--color-text-secondary)]">שאלה {idx + 1} &mdash; {q.topic}</span>
                <span className="text-sm font-mono font-bold text-[var(--color-accent-cobalt)]">{q.points} נק'</span>
              </div>

              <div className="p-4 sm:p-5 text-right text-lg text-[var(--color-text-primary)] leading-relaxed font-medium">
                {q.prompt}
              </div>

              <div className="px-4 pb-5 sm:px-5">
                
                {/* MULTIPLE CHOICE */}
                {q.type === 'multiple-choice' && (
                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const isSelected = answer === opt.id;
                      const showAsCorrect = isSubmitted && opt.correct;
                      const showAsWrong = isSubmitted && isSelected && !opt.correct;
                      
                      let bgClass = 'bg-[var(--color-surface-raised)]';
                      let borderClass = 'border-transparent';
                      let textClass = 'text-[var(--color-text-primary)]';

                      if (showAsCorrect) {
                        bgClass = 'bg-[var(--color-success)]/10'; borderClass = 'border-[var(--color-success)]/40'; textClass = 'text-[var(--color-success)]';
                      } else if (showAsWrong) {
                        bgClass = 'bg-[var(--color-error)]/10'; borderClass = 'border-[var(--color-error)]/40'; textClass = 'text-[var(--color-error)]';
                      } else if (isSelected) {
                        bgClass = 'bg-[var(--color-accent-cobalt)]/10'; borderClass = 'border-[var(--color-accent-cobalt)]/40'; textClass = 'text-[var(--color-accent-cobalt)]';
                      }

                      return (
                        <button
                          key={opt.id}
                          onClick={() => updateAnswer(q.id, opt.id)}
                          disabled={isSubmitted}
                          className={`w-full text-right flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${bgClass} ${borderClass} ${isSubmitted ? 'cursor-default' : 'hover:bg-[var(--color-surface-raised)]/80 cursor-pointer'}`}
                        >
                          <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-sm font-bold ${showAsCorrect ? 'border-[var(--color-success)] text-[var(--color-success)]' : showAsWrong ? 'border-[var(--color-error)] text-[var(--color-error)]' : isSelected ? 'border-[var(--color-accent-cobalt)] text-[var(--color-accent-cobalt)]' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}>
                            {opt.label}
                          </span>
                          <span className={`flex-1 text-base ${textClass}`}>
                            {opt.text ? opt.text : <InlineMath math={opt.latex || ''} />}
                          </span>
                          {showAsCorrect && <CheckCircle2 size={18} className="text-[var(--color-success)] shrink-0" />}
                          {showAsWrong && <XCircle size={18} className="text-[var(--color-error)] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* OPEN CALC / TEXT */}
                {(q.type === 'open-calc' || q.type === 'open-text') && (
                  <div className={`mt-4 w-full p-5 sm:p-6 rounded-xl relative overflow-hidden transition-all duration-700 ${
                      isSubmitted 
                        ? isCorrect 
                          ? 'bg-[var(--color-success)]/10 border border-[var(--color-success)]/40' 
                          : 'bg-[var(--color-error)]/10 border border-[var(--color-error)]/40'
                        : 'bg-transparent border border-transparent'
                    }`}
                  >
                    {isSubmitted && isCorrect && <CheckCircle2 size={100} className="absolute -top-4 -left-4 text-[var(--color-success)] opacity-10 pointer-events-none" />}
                    {isSubmitted && !isCorrect && <XCircle size={100} className="absolute -top-4 -left-4 text-[var(--color-error)] opacity-10 pointer-events-none" />}

                    <div className="max-w-sm ml-auto relative z-10">
                      <InputGroup
                        label="תשובה:"
                        value={answer || ''}
                        onChange={(val) => updateAnswer(q.id, val)}
                        disabled={isSubmitted}
                        dir={q.type === 'open-calc' ? 'ltr' : 'rtl'}
                      />
                    </div>
                  </div>
                )}

                {/* INTERACTIVE REGION */}
                {q.type === 'interactive-region' && (
                  <div className="mt-4 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] p-4">
                    <InteractiveNormalGraph 
                      value={answer as RegionType || null} 
                      onChange={(val) => updateAnswer(q.id, val)} 
                      disabled={isSubmitted}
                      correctRegion={q.correctRegion}
                    />
                    {isSubmitted && (
                      <div className="text-center mt-4 font-bold">
                        {isCorrect ? (
                          <span className="text-[var(--color-success)] flex items-center justify-center gap-2"><CheckCircle2 size={20} /> סימון נכון</span>
                        ) : (
                          <span className="text-[var(--color-error)] flex items-center justify-center gap-2"><XCircle size={20} /> סימון שגוי (האזור הנכון צבוע בירוק)</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* MULTI-PART */}
                {q.type === 'multi-part' && (
                  <div className="space-y-6 mt-4">
                    {q.parts.map((part, pIdx) => {
                      const pAnswer = answer?.[part.id] || '';
                      const pIsCorrect = results.multiSubScores[q.id]?.[part.id];

                      return (
                        <div 
                          key={part.id} 
                          id={`question-${q.id}-part-${part.id}`}
                          className={`rounded-xl p-5 border relative overflow-hidden transition-all duration-700 scroll-m-24 ${
                            highlightedId === `question-${q.id}-part-${part.id}` 
                              ? 'ring-2 ring-[var(--color-error)] shadow-lg shadow-[var(--color-error)]/20'
                              : ''
                          } ${
                            isSubmitted 
                              ? pIsCorrect 
                                ? 'bg-[var(--color-success)]/10 border-[var(--color-success)]/40' 
                                : 'bg-[var(--color-error)]/10 border-[var(--color-error)]/40'
                              : 'bg-[var(--color-surface)] border-[var(--color-border)]'
                          }`}
                        >
                          {isSubmitted && pIsCorrect && <CheckCircle2 size={100} className="absolute -top-4 -left-4 text-[var(--color-success)] opacity-10 pointer-events-none" />}
                          {isSubmitted && !pIsCorrect && <XCircle size={100} className="absolute -top-4 -left-4 text-[var(--color-error)] opacity-10 pointer-events-none" />}

                          <div className="flex items-center gap-3 font-bold text-[var(--color-text-primary)] mb-5 text-base relative z-10">
                            <span className="flex items-center justify-center w-7 h-7 shrink-0 rounded-full bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-sm shadow-sm">{hebrewLetters[pIdx]}</span>
                            <span>{part.prompt}</span>
                          </div>
                          
                          {part.type === 'multiple-choice' && (
                            <div className="space-y-2 relative z-10">
                              {part.options!.map((opt) => {
                                const isSelected = pAnswer === opt.id;
                                const showAsCorrect = isSubmitted && opt.correct;
                                const showAsWrong = isSubmitted && isSelected && !opt.correct;
                                
                                let bgClass = 'bg-[var(--color-surface-raised)]'; let borderClass = 'border-transparent'; let textClass = 'text-[var(--color-text-primary)]';
                                if (showAsCorrect) { bgClass = 'bg-[var(--color-success)]/10'; borderClass = 'border-[var(--color-success)]/40'; textClass = 'text-[var(--color-success)]'; }
                                else if (showAsWrong) { bgClass = 'bg-[var(--color-error)]/10'; borderClass = 'border-[var(--color-error)]/40'; textClass = 'text-[var(--color-error)]'; }
                                else if (isSelected) { bgClass = 'bg-[var(--color-accent-cobalt)]/10'; borderClass = 'border-[var(--color-accent-cobalt)]/40'; textClass = 'text-[var(--color-accent-cobalt)]'; }

                                return (
                                  <button key={opt.id} onClick={() => updateMultiPartAnswer(q.id, part.id, opt.id)} disabled={isSubmitted} className={`w-full text-right flex items-center gap-3 px-3 py-2 rounded border transition-all ${bgClass} ${borderClass} ${isSubmitted ? 'cursor-default' : 'hover:bg-[var(--color-surface-raised)]/80 cursor-pointer'}`}>
                                    <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border text-xs font-bold ${showAsCorrect ? 'border-[var(--color-success)] text-[var(--color-success)]' : showAsWrong ? 'border-[var(--color-error)] text-[var(--color-error)]' : isSelected ? 'border-[var(--color-accent-cobalt)] text-[var(--color-accent-cobalt)]' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}>
                                      {opt.label}
                                    </span>
                                    <span className={`flex-1 text-sm ${textClass}`}>{opt.text ? opt.text : <InlineMath math={opt.latex || ''} />}</span>
                                    {showAsCorrect && <CheckCircle2 size={16} className="text-[var(--color-success)] shrink-0" />}
                                    {showAsWrong && <XCircle size={16} className="text-[var(--color-error)] shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {(part.type === 'open-calc' || part.type === 'open-text') && (
                            <div className="w-full max-w-sm ml-auto relative z-10 mt-2">
                              <InputGroup
                                label="תשובה:"
                                value={pAnswer}
                                onChange={(val) => updateMultiPartAnswer(q.id, part.id, val)}
                                disabled={isSubmitted}
                                dir={part.type === 'open-calc' ? 'ltr' : 'rtl'}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* RATIONALE */}
              {isSubmitted && q.rationale && (
                <div className="border-t border-[var(--color-border)] px-4 py-3 sm:px-5 bg-[var(--color-surface)]/50">
                  <InsightBlock>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                      <div className="text-right text-sm leading-relaxed text-[var(--color-text-secondary)]">
                        {q.rationale}
                        {(q.type === 'open-calc' || q.type === 'open-text') && !isCorrect && (
                          <div className="mt-2 text-[var(--color-text-primary)] font-bold">
                            תשובה נכונה: {q.type === 'open-calc' ? q.correctAnswer : q.correctAnswers[0]}
                          </div>
                        )}
                        {q.type === 'multi-part' && !isCorrect && (
                          <div className="mt-3 text-[var(--color-text-primary)] font-bold text-xs space-y-1">
                            {q.parts.map((p, pIdx) => {
                              if (p.type === 'open-calc') return <div key={p.id}>סעיף {hebrewLetters[pIdx]}': התשובה היא {p.correctAnswer}</div>;
                              if (p.type === 'open-text') return <div key={p.id}>סעיף {hebrewLetters[pIdx]}': התשובה היא {p.correctAnswers?.[0]}</div>;
                              return null;
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </InsightBlock>
                </div>
              )}
            </Card>
          );
        })}

        {/* Submit button / Results */}
        {!isSubmitted ? (
          <div className="flex justify-center pt-6 pb-12">
            <Button size="lg" variant="primary" onClick={handleSubmit} className="px-12 text-lg font-bold">
              סיום ובדיקה
            </Button>
          </div>
        ) : (
          <div className="pt-6 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <ResultBlock isReject={scorePercentage < 60}>
              <div className="text-center mt-2 space-y-2">
                <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {scorePercentage >= 60 ? "כל הכבוד!" : "יש מקום לשיפור"}
                </h3>
                <p className="text-xl font-medium text-[var(--color-text-secondary)]">
                  הציון שלך: {scorePercentage} / 100
                </p>
                <p className="text-lg text-[var(--color-text-primary)] font-bold">
                  ענית נכון על {correctParts} מתוך {totalParts} סעיפים.
                </p>
                <div className="flex justify-center gap-4 mt-4">
                  <Badge variant="success" className="text-sm px-3 py-1">
                    <CheckCircle2 size={16} className="ml-1" />
                    {Object.values(results.itemized).filter(Boolean).length} שאלות מלאות נכונות
                  </Badge>
                  {errorItems.length > 0 ? (
                    <button 
                      onClick={() => scrollToError(0)}
                      className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-error)] focus:ring-offset-2 border-transparent bg-[var(--color-error)]/20 text-[var(--color-error)] hover:bg-[var(--color-error)]/30 cursor-pointer"
                    >
                      <XCircle size={16} className="ml-1" />
                      צפה ב-{errorItems.length} שגיאות (לחץ לניווט)
                    </button>
                  ) : (
                    <Badge variant="crimson" className="text-sm px-3 py-1 opacity-50">
                      <XCircle size={16} className="ml-1" />
                      0 שגיאות!
                    </Badge>
                  )}
                </div>
                <div className="pt-6">
                  <Button variant="ghost" onClick={handleReset}>
                    נסה שוב
                  </Button>
                </div>
              </div>
            </ResultBlock>
          </div>
        )}
      </div>

      {/* Floating Error Navigator */}
      {isSubmitted && errorItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-surface-raised)] border border-[var(--color-border)] shadow-xl rounded-full px-4 py-2 flex items-center gap-4 text-[var(--color-text-primary)] animate-in slide-in-from-bottom-10">
          <span className="text-sm font-bold text-[var(--color-error)] flex items-center gap-2">
            <XCircle size={16} />
            שגיאה {currentErrorIdx + 1} מתוך {errorItems.length}
          </span>
          <div className="flex items-center gap-2 border-r border-[var(--color-border)] pr-4">
            <button 
              onClick={() => scrollToError(currentErrorIdx > 0 ? currentErrorIdx - 1 : errorItems.length - 1)}
              className="p-1.5 hover:bg-[var(--color-surface)] rounded-md transition-colors"
              title="לשגיאה הקודמת (למעלה)"
            >
              <ChevronUp size={20} />
            </button>
            <button 
              onClick={() => scrollToError(currentErrorIdx < errorItems.length - 1 ? currentErrorIdx + 1 : 0)}
              className="p-1.5 hover:bg-[var(--color-surface)] rounded-md transition-colors"
              title="לשגיאה הבאה (למטה)"
            >
              <ChevronDown size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
