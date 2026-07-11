import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    plugins: {
      react,
    },
    rules: {
    },
  },
  {
    files: ['**/*Calculator.tsx', '**/calc-ui/**/*.tsx'],
    rules: {
      // DESIGN.md §3 "Strict Adherence Rule": calculators must use <Heading>,
      // never raw <h1>/<h2>/<h3>. The legitimate <Heading> component (in
      // web/src/components/ui/Heading.tsx) renders the semantic tag itself, so
      // forbidding the literal JSX elements enforces the rule at the lint level.
      'react/forbid-elements': [
        'error',
        {
          forbid: [
            { element: 'h1', message: 'Use <Heading level="page"> instead of raw <h1> (DESIGN.md §3).' },
            { element: 'h2', message: 'Use <Heading level="section"> instead of raw <h2> (DESIGN.md §3).' },
            { element: 'h3', message: 'Use <Heading level="subsection"> instead of raw <h3> (DESIGN.md §3).' },
          ],
        },
      ],
    },
  },
  {
    ignores: ['dist', 'node_modules', '.worktrees', 'coverage'],
  },
);
