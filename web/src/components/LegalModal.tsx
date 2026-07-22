import type { ReactElement } from 'react';
import { Modal } from './ui/Modal';
import { ShieldAlert } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LegalModal({ isOpen, onClose }: LegalModalProps): ReactElement {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="תנאי שימוש וזכויות יוצרים"
      description="מידע משפטי על זכויות היוצרים של פרויקט זה."
      size="md"
      footer={
        <div className="flex w-full items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-body-base font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-cobalt)] focus-visible:ring-offset-2 bg-[var(--color-surface-raised)]"
          >
            סגירה
          </button>
        </div>
      }
    >
      <div className="space-y-6 py-4">
        <div className="flex items-center gap-3 text-[var(--color-error)]">
          <ShieldAlert className="h-6 w-6 shrink-0" strokeWidth={1.8} aria-hidden="true" />
          <h3 className="text-heading-section font-semibold">
            הצהרת זכויות יוצרים
          </h3>
        </div>
        
        <p className="text-body-base font-medium leading-7 text-[var(--color-text-primary)]">
          פרויקט זה, כולל הממשק, העיצוב, הקוד, החישובים וכלל התוכן המוצג בו, 
          הינו קניינו הרוחני הבלעדי של <strong className="font-bold text-[var(--color-text-primary)]">רוברט טייגר</strong>.
        </p>
        
        <p className="text-body-base font-medium leading-7 text-[var(--color-text-primary)]">
          יצירה זו מעוגנת משפטית. כל שימוש מסחרי או לא מסחרי, העתקה, שעתוק, הפצה, או שינוי של המערכת 
          או כל חלק ממנה ללא אישור מפורש בכתב, <strong className="font-bold text-[var(--color-error)]">מהווה הפרה בוטה של זכויות יוצרים</strong> וחשוף לתביעה משפטית.
        </p>

        <p className="text-body-sm font-semibold text-[var(--color-text-secondary)]">
          כל הזכויות שמורות © {new Date().getFullYear()} רוברט טייגר.
        </p>
      </div>
    </Modal>
  );
}
