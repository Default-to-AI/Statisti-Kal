import React, { useState } from 'react';
import { PageLayout, Heading } from './ui';
import { ArrowRight, Brain, Zap, Target } from 'lucide-react';
import { Difficulty, testQuestions } from '../data/testQuestions';
import { TestRunner } from './TestRunner';

export default function TestYourselfPage(): React.ReactElement {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);

  // Render Selection Screen
  if (!selectedDifficulty) {
    return (
      <PageLayout activePage="test-yourself">
        <Heading level="page" withAccentBar accent="brass" className="mb-8 mt-4 text-center">
          בחן את עצמך
        </Heading>
        
        <p className="text-center text-lg text-[var(--color-text-secondary)] mb-12 px-4 max-w-2xl mx-auto leading-relaxed">
          בחרו את רמת הקושי הרצויה ובדקו את הידע שלכם. הרמה הקלה בוחנת הבנה בסיסית, בעוד הרמות הגבוהות מצריכות יותר חישובים והבנה מעמיקה.
        </p>

        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            
            {/* Easy Card */}
            <button 
              onClick={() => setSelectedDifficulty('easy')}
              className="group cursor-pointer text-right text-[var(--color-text-primary)] flex flex-col items-start p-6 sm:p-8 rounded-2xl border-2 border-transparent bg-[var(--color-success)]/10 hover:border-[var(--color-success)]/50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-success)]"
            >
              <div className="p-3 bg-[var(--color-success)]/20 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-[var(--color-success)]" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-[var(--color-success)]">רמה קלה</h3>
              <p className="text-[var(--color-text-secondary)] mb-6 text-sm sm:text-base">
                10 שאלות בסיסיות לבדיקת הבנת המושגים והרעיונות המרכזיים של הקורס.
              </p>
              <span className="mt-auto font-bold text-[var(--color-success)] flex items-center gap-2">
                התחל מבחן קל <ArrowRight size={18} className="rotate-180" />
              </span>
            </button>

            {/* Medium Card */}
            <button 
              onClick={() => setSelectedDifficulty('medium')}
              className="group cursor-pointer text-right text-[var(--color-text-primary)] flex flex-col items-start p-6 sm:p-8 rounded-2xl border-2 border-transparent bg-[var(--color-warning)]/10 hover:border-[var(--color-warning)]/50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-warning)]"
            >
              <div className="p-3 bg-[var(--color-warning)]/20 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-[var(--color-warning)]" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-[var(--color-warning)]">רמה בינונית</h3>
              <p className="text-[var(--color-text-secondary)] mb-6 text-sm sm:text-base">
                10 שאלות הדורשות חישובים פשוטים על נייר והבנה טובה של הנוסחאות.
              </p>
              <span className="mt-auto font-bold text-[var(--color-warning)] flex items-center gap-2">
                התחל מבחן בינוני <ArrowRight size={18} className="rotate-180" />
              </span>
            </button>

            {/* Hard Card */}
            <button 
              onClick={() => setSelectedDifficulty('hard')}
              className="group cursor-pointer text-right text-[var(--color-text-primary)] flex flex-col items-start p-6 sm:p-8 rounded-2xl border-2 border-transparent bg-[var(--color-error)]/10 hover:border-[var(--color-error)]/50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-error)]"
            >
              <div className="p-3 bg-[var(--color-error)]/20 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-[var(--color-error)]" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-[var(--color-error)]">רמה קשה</h3>
              <p className="text-[var(--color-text-secondary)] mb-6 text-sm sm:text-base">
                10 שאלות מאתגרות המשלבות חישובים מורכבים (כמו פירוק סכומים ומתאמים).
              </p>
              <span className="mt-auto font-bold text-[var(--color-error)] flex items-center gap-2">
                התחל מבחן קשה <ArrowRight size={18} className="rotate-180" />
              </span>
            </button>

            {/* Full Exam Card */}
            <button 
              onClick={() => setSelectedDifficulty('exam')}
              className="group cursor-pointer text-right text-[var(--color-text-primary)] flex flex-col items-start p-6 sm:p-8 rounded-2xl border-2 border-transparent bg-[var(--color-accent-cobalt)]/10 hover:border-[var(--color-accent-cobalt)]/50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-cobalt)]"
            >
              <div className="p-3 bg-[var(--color-accent-cobalt)]/20 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-[var(--color-accent-cobalt)]" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-[var(--color-accent-cobalt)]">מבחן מלא</h3>
              <p className="text-[var(--color-text-secondary)] mb-6 text-sm sm:text-base">
                סימולציית בחינה מלאה המכילה 5 שאלות מורכבות ורב-סעיפיות ממבחני עבר.
              </p>
              <span className="mt-auto font-bold text-[var(--color-accent-cobalt)] flex items-center gap-2">
                התחל מבחן מסכם <ArrowRight size={18} className="rotate-180" />
              </span>
            </button>

          </div>
        </div>
      </PageLayout>
    );
  }

  // Render Test Runner
  return (
    <PageLayout activePage="test-yourself">
      <TestRunner 
        difficulty={selectedDifficulty}
        questions={testQuestions[selectedDifficulty]}
        onBack={() => setSelectedDifficulty(null)}
      />
    </PageLayout>
  );
}
