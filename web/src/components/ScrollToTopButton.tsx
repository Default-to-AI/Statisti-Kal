import type { ReactElement } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopButtonProps {
  visible: boolean;
}

/**
 * Animated floating scroll-to-top button.
 * Shows/hides with a scale + slide animation. Includes hover/tap micro-interactions.
 */
export function ScrollToTopButton({ visible }: ScrollToTopButtonProps): ReactElement {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          className="tour-scroll-top-button fixed bottom-6 left-6 z-50 flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-[var(--color-accent-cobalt)] shadow-lg backdrop-blur-sm transition-colors hover:border-[var(--color-accent-cobalt-line)] hover:bg-[var(--color-accent-cobalt)] hover:text-white cursor-pointer"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          title="חזרה לראש העמוד"
          aria-label="חזרה לראש העמוד"
        >
          <ArrowUp size={22} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
