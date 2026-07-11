import { useLocalStorageState } from '../hooks/useLocalStorageState';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { InlineMath, BlockMath } from 'react-katex';
import {
  Info,
  Calculator,
  RefreshCw,
  HelpCircle,
  AlertCircle,
  BookOpen,
  Settings,
  ChevronDown,
  ChevronUp,
  Sliders,
  X,
  Award,
  Star,
  Percent,
  Sigma,
  Target,
  Sparkles
} from 'lucide-react';
import HypothesisTestingCalculator from './HypothesisTestingCalculator';
import FormulaSheet from './FormulaSheet';
import { type SitePage } from './SiteHeader';
import {
  CalculatorSidebar,
  ChartWrapper,
  EmptyState,
  SectionHeader,
  Tooltip as UITooltip,
  PageHeader,
  Heading,
} from './ui';
import {
  CalculationVariantPicker,
  CalculatorModeSwitch,
  ConditionalEventDefinitionCard,
  ConditionalValueField,
  FORWARD_VARIANT_OPTIONS,
  INVERSE_VARIANT_OPTIONS,
  InlineMathToken,
  ParameterInputCell,
  getConditionalEventMath,
  type CalculatorMode,
  type CalcMode,
  type CalcType,
  type CondType,
} from './calc-ui';
import {
  inverseNormalCDF,
  normalCDF,
} from '../lib/statistics/math';
import { NormalChart } from './charts/NormalChart';
import { FormattedStep } from './results/FormattedStep';
import { ZTable } from './tables/ZTable';
import { TTable } from './tables/TTable';

// --- Types ---

type NavAccent = 'brass' | 'cobalt' | 'teal' | 'neutral';

interface CalculationResult {
  probability: number;
  z1: number;
  z2?: number;
  steps: string[];
  calculatedX?: number;
}

interface NavigationTab {
  id: CalcMode;
  label: string;
  icon: React.ReactNode;
  accent: NavAccent;
}

interface HeroStep {
  number: number;
  title: string;
  description: React.ReactNode;
}

function getCalculatorHeroCopy(mode: CalculatorMode): { title: string; steps: HeroStep[] } {
  if (mode === 'forward') {
    return {
      title: 'מחשבון הסתברות בהתפלגות נורמלית',
      steps: [
        { number: 1, title: 'הגדירו התפלגות', description: <>הזינו את פרמטרי תוחלת (<InlineMath math="\mu" />) וסטיית תקן (<InlineMath math="\sigma" />) של המדגם.</> },
        { number: 2, title: 'בחרו יעד חישוב', description: <>בחרו סוג שטח (מעל, מתחת, בין) והזינו ערכי מטרה (<InlineMath math="X" />).</> },
        { number: 3, title: 'קבלו תוצאות', description: <>צפו בגרף החישוב, ב-<InlineMath math="Z" />-score ובדרך הפתרון המלאה צעד-אחר-צעד.</> },
      ]
    };
  }

  return {
    title: 'מחשבון אחוזונים וערכים קריטיים',
    steps: [
      { number: 1, title: 'הגדירו התפלגות', description: <>הזינו את פרמטרי תוחלת (<InlineMath math="\mu" />) וסטיית תקן (<InlineMath math="\sigma" />) של המדגם.</> },
      { number: 2, title: 'בחרו אחוזון יעד', description: <>בחרו כיוון (למשל, אחוזון עליון) והזינו את ההסתברות (<InlineMath math="P" />).</> },
      { number: 3, title: 'קבלו תוצאות', description: <>גלו את הערך המדויק (<InlineMath math="X" />), ה-<InlineMath math="Z" />-score וצפו בגרף אינטראקטיבי.</> },
    ]
  };
}

// --- Components ---

// --- Recharts-based Interactive Normal Chart ---
interface NormalDistributionCalculatorProps {
  initialMode?: CalcMode;
  onNavigate?: (page: SitePage) => void;
}

export default function NormalDistributionCalculator({ initialMode, onNavigate }: NormalDistributionCalculatorProps = {}) {
  // Main persistent states
  const [mode, setMode] = useLocalStorageState<CalcMode>('ND_mode', 'hypothesis');

  useEffect(() => {
    if (initialMode && initialMode !== mode) {
      setMode(initialMode);
    }
  }, [initialMode, mode, setMode]);

  // Normal parameters
  const [mean, setMean] = useLocalStorageState<number>('ND_mean_v2', 100);
  const [meanInput, setMeanInput] = useLocalStorageState<string>('ND_meanInput_v2', '100');

  const [stdDev, setStdDev] = useLocalStorageState<number>('ND_stdDev_v2', 15);
  const [stdDevInput, setStdDevInput] = useLocalStorageState<string>('ND_stdDevInput_v2', '15');

  // Forward calculations values
  const [forwardType, setForwardType] = useLocalStorageState<CalcType>('ND_forwardType', 'below');
  const [x1, setX1] = useLocalStorageState<number>('ND_x1_v2', 115);
  const [x1Input, setX1Input] = useLocalStorageState<string>('ND_x1Input_v2', '115');
  const [x2, setX2] = useLocalStorageState<number>('ND_x2_v2', 125);
  const [x2Input, setX2Input] = useLocalStorageState<string>('ND_x2Input_v2', '125');

  // Inverse calculations values
  const [inverseProb, setInverseProb] = useLocalStorageState<number>('ND_inverseProb', 0.95);
  const [inverseProbInput, setInverseProbInput] = useLocalStorageState<string>('ND_inverseProbInput', '0.95');
  const [inverseType, setInverseType] = useLocalStorageState<CalcType>('ND_inverseType', 'below');

  // Conditional calculations values
  const [condType, setCondType] = useLocalStorageState<CondType>('ND_condType', 'above');
  const [condTypeA, setCondTypeA] = useLocalStorageState<CondType>('ND_condTypeA', 'below');
  const [condX1, setCondX1] = useLocalStorageState<number>('ND_condX1', 110);
  const [condX1Input, setCondX1Input] = useLocalStorageState<string>('ND_condX1Input', '110');
  const [condX2, setCondX2] = useLocalStorageState<number>('ND_condX2', 120);
  const [condX2Input, setCondX2Input] = useLocalStorageState<string>('ND_condX2Input', '120');

  // URL Routing for Direct Links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get('mode') || window.location.hash.replace('#', '');
    const validModes = ['forward', 'inverse'];
    if (urlMode && validModes.includes(urlMode)) {
      setMode(urlMode as CalcMode);
    }
    // Forward/Inverse type from URL
    const urlType = params.get('type');
    const validTypes = ['below', 'above', 'between', 'outside'];
    if (urlType && validTypes.includes(urlType)) {
      if (urlMode === 'forward' || urlMode === null) {
        setForwardType(urlType as CalcType);
      } else if (urlMode === 'inverse') {
        setInverseType(urlType as CalcType);
      }
    }
    // Parameters from URL
    const urlMu = params.get('mu');
    if (urlMu && !isNaN(parseFloat(urlMu))) {
      const val = parseFloat(urlMu);
      setMean(val);
      setMeanInput(urlMu);
    }
    const urlSigma = params.get('sd') || params.get('sigma');
    if (urlSigma && !isNaN(parseFloat(urlSigma))) {
      const val = parseFloat(urlSigma);
      setStdDev(val);
      setStdDevInput(urlSigma);
    }
    const urlX = params.get('x');
    if (urlX && !isNaN(parseFloat(urlX))) {
      const val = parseFloat(urlX);
      setX1(val);
      setX1Input(urlX);
    }
    const urlX2 = params.get('x2');
    if (urlX2 && !isNaN(parseFloat(urlX2))) {
      const val = parseFloat(urlX2);
      setX2(val);
      setX2Input(urlX2);
    }
    const urlP = params.get('p');
    if (urlP && !isNaN(parseFloat(urlP))) {
      const val = parseFloat(urlP);
      if (val > 0 && val < 1) {
        setInverseProb(val);
        setInverseProbInput(urlP);
      }
    }
  }, []);

  // Validations
  const errors = useMemo(() => {
    const errs: { [key: string]: string } = {};
    if (meanInput.trim() === '' || isNaN(parseFloat(meanInput))) errs.mean = 'נא להזין מספר תקין';
    const sdVal = parseFloat(stdDevInput);
    if (stdDevInput.trim() === '' || isNaN(sdVal)) errs.stdDev = 'נא להזין מספר תקין';
    else if (sdVal <= 0) errs.stdDev = 'סטיית תקן חייבת להיות גדולה מ-0';

    if (mode === 'forward') {
      if (x1Input.trim() === '' || isNaN(parseFloat(x1Input))) errs.x1 = 'נא להזין מספר תקין';
      if ((forwardType === 'between' || forwardType === 'outside') && (x2Input.trim() === '' || isNaN(parseFloat(x2Input)))) {
        errs.x2 = 'נא להזין מספר תקין';
      }
    } else if (mode === 'inverse') {
      const probVal = parseFloat(inverseProbInput);
      if (inverseProbInput.trim() === '' || isNaN(probVal)) errs.inverseProb = 'נא להזין מ-0 עד 1';
      else if (probVal <= 0 || probVal >= 1) errs.inverseProb = 'הסתברות חייבת להיות בטווח הפתוח (0, 1)';
    }

    return errs;
  }, [meanInput, stdDevInput, x1Input, x2Input, inverseProbInput, forwardType, mode]);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  // Handlers for inputs
  const handleMeanChange = (val: string) => {
    setMeanInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) setMean(parsed);
  };

  const handleStdDevChange = (val: string) => {
    setStdDevInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) setStdDev(parsed);
  };

  const handleX1Change = (val: string) => {
    setX1Input(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) setX1(parsed);
  };

  const handleX2Change = (val: string) => {
    setX2Input(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) setX2(parsed);
  };

  const handleInverseProbChange = (val: string) => {
    setInverseProbInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0 && parsed < 1) setInverseProb(parsed);
  };

  const handleCondX1Change = (val: string) => {
    setCondX1Input(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) setCondX1(parsed);
  };

  const handleCondX2Change = (val: string) => {
    setCondX2Input(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) setCondX2(parsed);
  };

  // Core Calculations
  const calculation = useMemo<CalculationResult | null>(() => {
    if (!isValid) return null;

    if (mode === 'forward') {
      const steps: string[] = [];
      steps.push(`שלב 1 | זיהוי פרמטרי ההתפלגות | האוכלוסייה מתפלגת נורמלית עם תוחלת [MATH]\\mu = ${mean}[/MATH] וסטיית תקן [MATH]\\sigma = ${stdDev}[/MATH].`);

      if (forwardType === 'conditional') {
        // interval B elements
        let pB = 0;
        let bExpr = '';
        let bText = '';
        if (condType === 'below') {
          pB = normalCDF(condX1, mean, stdDev);
          bExpr = `X \\le ${condX1}`;
          bText = `P(X \\le ${condX1}) = \\Phi\\left(\\frac{${condX1} - ${mean}}{${stdDev}}\\right) = \\Phi(${((condX1 - mean) / stdDev).toFixed(2)}) = ${pB.toFixed(4)}`;
          steps.push(`שלב 2 | חישוב הסתברות תנאי הרקע B | [MATH]P(${bExpr})[/MATH].`);
          steps.push(`[MATH]${bText}[/MATH]`);
        } else if (condType === 'above') {
          pB = 1 - normalCDF(condX1, mean, stdDev);
          bExpr = `X \\ge ${condX1}`;
          bText = `P(X \\ge ${condX1}) = 1 - \\Phi(${((condX1 - mean) / stdDev).toFixed(2)}) = ${pB.toFixed(4)}`;
          steps.push(`שלב 2 | חישוב הסתברות תנאי הרקע B | [MATH]P(${bExpr})[/MATH].`);
          steps.push(`[MATH]${bText}[/MATH]`);
        } else {
          const bStart = Math.min(condX1, condX2);
          const bEnd = Math.max(condX1, condX2);
          pB = normalCDF(bEnd, mean, stdDev) - normalCDF(bStart, mean, stdDev);
          bExpr = `${bStart} \\le X \\le ${bEnd}`;
          bText = `P(${bExpr}) = \\Phi(${((bEnd - mean) / stdDev).toFixed(2)}) - \\Phi(${((bStart - mean) / stdDev).toFixed(2)}) = ${pB.toFixed(4)}`;
          steps.push(`שלב 2 | חישוב הסתברות תנאי הרקע B | [MATH]P(${bExpr})[/MATH].`);
          steps.push(`[MATH]${bText}[/MATH]`);
        }

        // Interval A elements
        let aExpr = '';
        if (condTypeA === 'below') aExpr = `X \\le ${x1}`;
        else if (condTypeA === 'above') aExpr = `X \\ge ${x1}`;
        else aExpr = `${Math.min(x1, x2)} \\le X \\le ${Math.max(x1, x2)}`;

        // Joint interval start and end (intersection)
        const getRange = (t: string, v1: number, v2: number): [number, number] => {
          if (t === 'below') return [-Infinity, v1];
          if (t === 'above') return [v1, Infinity];
          return [Math.min(v1, v2), Math.max(v1, v2)];
        };
        const rA = getRange(condTypeA, x1, x2);
        const rB = getRange(condType, condX1, condX2);

        const interS = Math.max(rA[0], rB[0]);
        const interE = Math.min(rA[1], rB[1]);

        let pJoint = 0;
        steps.push(`שלב 3 | הגדרת חיתוך המאורעות | המאורע [MATH]A \\cap B[/MATH] מוגדר כחיתוך שני התנאים כדי לחשב [MATH]P(A \\cap B)[/MATH].`);

        if (interS < interE) {
          const capStartSym = interS === -Infinity ? '-\\infty' : interS.toFixed(2);
          const capEndSym = interE === Infinity ? '\\infty' : interE.toFixed(2);
          pJoint = (interE === Infinity ? 1 : normalCDF(interE, mean, stdDev)) - (interS === -Infinity ? 0 : normalCDF(interS, mean, stdDev));
          steps.push(`טווח החיתוך הוא הטווח המשותף של שני התנאים: [MATH][${capStartSym}, ${capEndSym}][/MATH].`);
          steps.push(`ההסתברות המשותפת: [MATH]P(A \\cap B) = P(${interS === -Infinity ? '' : `${interS.toFixed(1)} \\le `}X \\le ${interE === Infinity ? '' : interE.toFixed(1)}) = ${pJoint.toFixed(4)}[/MATH]`);
        } else {
          steps.push(`טווח החיתוך ריק! לשני המאורעות אין חפיפה בדגימות.`);
          steps.push(`ההסתברות המשותפת במקרה זה: [MATH]P(A \\cap B) = 0[/MATH]`);
        }

        const finalProb = pB > 0 ? pJoint / pB : 0;
        steps.push(`שלב 4 | חישוב הסתברות מותנית | שימוש בנוסחת ההסתברות המותנית: [MATH]P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}[/MATH].`);
        steps.push(`תוצאה סופית: מהשלבים לעיל נקבל: [MATH]P(A \\mid B) = \\frac{${pJoint.toFixed(4)}}{${pB.toFixed(4)}} = ${finalProb.toFixed(4)}[/MATH]`);

        return {
          probability: finalProb,
          z1: (x1 - mean) / stdDev,
          z2: (x2 - mean) / stdDev,
          steps
        };
      }

      // Standard calculations
      const z1 = (x1 - mean) / stdDev;
      const z2 = (x2 - mean) / stdDev;
      let prob = 0;

      steps.push(`שלב 2 | תקינה והמרת ערכים לציון תקן (Z) | נוסחת ציון התקן היא [MATH]Z = \\frac{X - \\mu}{\\sigma}[/MATH].`);

      if (forwardType === 'below') {
        prob = normalCDF(x1, mean, stdDev);
        steps.push(`החלפת ערכים נותנת: [MATH]Z_1 = \\frac{${x1} - ${mean}}{${stdDev}} = ${z1.toFixed(4)}[/MATH].`);
        steps.push(`שלב 3 | איתור שטח משמאל | שימוש בפונקציית ההתפלגות המצטברת (CDF) לאיתור השטח שמשמאל ל-Z: [MATH]P(X \\le ${x1}) = P(Z \\le ${z1.toFixed(2)}) = \\Phi(${z1.toFixed(2)})[/MATH].`);
        steps.push(`תוצאה סופית: ההסבר הסטטיסטי מבוטא כשטח ההתפלגות [MATH]P(X \\le ${x1}) = ${prob.toFixed(4)}[/MATH] (או ${(prob * 100).toFixed(2)}% מהאוכלוסייה).`);
      } else if (forwardType === 'above') {
        prob = 1 - normalCDF(x1, mean, stdDev);
        steps.push(`החלפת ערכים נותנת: [MATH]Z_1 = \\frac{${x1} - ${mean}}{${stdDev}} = ${z1.toFixed(4)}[/MATH].`);
        steps.push(`שלב 3 | איתור שטח מימין | השטח מימין ל-Z הוא המשלים לשלם: [MATH]P(X \\ge ${x1}) = P(Z \\ge ${z1.toFixed(2)}) = 1 - \\Phi(${z1.toFixed(2)})[/MATH].`);
        steps.push(`תוצאה סופית: השטח המבוקש מימין הוא [MATH]P(X \\ge ${x1}) = 1 - ${normalCDF(x1, mean, stdDev).toFixed(4)} = ${prob.toFixed(4)}[/MATH] (או ${(prob * 100).toFixed(2)}%).`);
      } else if (forwardType === 'between') {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const zMin = (minX - mean) / stdDev;
        const zMax = (maxX - mean) / stdDev;
        prob = normalCDF(maxX, mean, stdDev) - normalCDF(minX, mean, stdDev);
        steps.push(`חישוב ציוני תקן לשני הגבולות:`);
        steps.push(`[MATH]Z_{Min} = \\frac{${minX} - ${mean}}{${stdDev}} = ${zMin.toFixed(2)}[/MATH]`);
        steps.push(`[MATH]Z_{Max} = \\frac{${maxX} - ${mean}}{${stdDev}} = ${zMax.toFixed(2)}[/MATH]`);
        steps.push(`שלב 3 | שטח בין שני גבולות | מציאת ההפרש בין השטח המצטבר של הגבול העליון לגבול התחתון: [MATH]P(${minX} \\le X \\le ${maxX}) = \\Phi(${zMax.toFixed(2)}) - \\Phi(${zMin.toFixed(2)})[/MATH].`);
        steps.push(`תוצאה סופית: השטח הכלוא בין שני הגבולות במדגם הוא [MATH]P(${minX} \\le X \\le ${maxX}) = ${normalCDF(maxX, mean, stdDev).toFixed(4)} - ${normalCDF(minX, mean, stdDev).toFixed(4)} = ${prob.toFixed(4)}[/MATH] (או ${(prob * 100).toFixed(2)}%).`);
      } else {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const zMin = (minX - mean) / stdDev;
        const zMax = (maxX - mean) / stdDev;
        prob = 1 - (normalCDF(maxX, mean, stdDev) - normalCDF(minX, mean, stdDev));
        steps.push(`חישוב ציוני תקן לשני הקצוות:`);
        steps.push(`[MATH]Z_{Min} = \\frac{${minX} - ${mean}}{${stdDev}} = ${zMin.toFixed(2)}[/MATH]`);
        steps.push(`[MATH]Z_{Max} = \\frac{${maxX} - ${mean}}{${stdDev}} = ${zMax.toFixed(2)}[/MATH]`);
        steps.push(`שלב 3 | השטח בזנבות | השטח שמחוץ לשני הגבולות (שני הזנבות במשותף) מחושב כמשלים של השטח שביניהם: [MATH]P(X \\le ${minX} \\cup X \\ge ${maxX}) = 1 - (\\Phi(${zMax.toFixed(2)}) - \\Phi(${zMin.toFixed(2)}))[/MATH].`);
        steps.push(`תוצאה סופית: השטח המשולב בקצוות התפלגות האוכלוסייה הוא [MATH]P(X \\le ${minX} \\cup X \\ge ${maxX}) = ${prob.toFixed(4)}[/MATH] (או ${(prob * 100).toFixed(2)}%).`);
      }

      return {
        probability: prob,
        z1,
        z2,
        steps
      };
    } else {
      // Inverse mode
      const steps: string[] = [];
      steps.push(`שלב 1 | זיהוי פרמטרים והסתברות | ההתפלגות היא [MATH]\\mu = ${mean}, \\sigma = ${stdDev}[/MATH] והשטח המצטבר הנתון הוא [MATH]p = ${inverseProb}[/MATH] (כלומר ${(inverseProb * 100).toFixed(1)}%).`);

      let z = 0;
      let calculatedX = mean;
      steps.push(`שלב 2 | מציאת ציון התקן התואם | מציאת ציון התקן (Z-score) התואם לשטח הנתון בהתפלגות הנורמלית הסטנדרטית באמצעות פונקציה הפוכה:`);

      if (inverseType === 'below') {
        z = inverseNormalCDF(inverseProb);
        calculatedX = mean + z * stdDev;
        steps.push(`עבור שטח מצטבר משמאל של [MATH]p = ${inverseProb}[/MATH], ציון התקן התואם הוא [MATH]Z = \\Phi^{-1}(${inverseProb}) = ${z.toFixed(4)}[/MATH].`);
        steps.push(`שלב 3 | חילוץ ערך פיזי (X) | שחרור הציון היחסי חזרה לערך פיזי לא מנורמל ע"י הנוסחה: [MATH]X = \\mu + Z \\cdot \\sigma[/MATH].`);
        steps.push(`תוצאה סופית: ערך ה-X המתקבל הוא [MATH]X = ${mean} + (${z.toFixed(2)}) \\cdot ${stdDev} = ${calculatedX.toFixed(2)}[/MATH].`);
      } else if (inverseType === 'above') {
        z = inverseNormalCDF(1 - inverseProb);
        calculatedX = mean + z * stdDev;
        steps.push(`בגלל שמבוקש שטח מצטבר מימין (מעל) של [MATH]p = ${inverseProb}[/MATH], אנו מחפשים שטח משמאל של [MATH]1 - p = ${(1 - inverseProb).toFixed(4)}[/MATH].`);
        steps.push(`ערך ה-Z התואם הוא [MATH]Z = \\Phi^{-1}(${(1 - inverseProb).toFixed(4)}) = ${z.toFixed(4)}[/MATH].`);
        steps.push(`שלב 3 | המרה חזרה לערכי X | נחלץ את ערך ה-X המקורי: [MATH]X = \\mu + Z \\cdot \\sigma[/MATH].`);
        steps.push(`תוצאה סופית: ערך ה-X המתקבל הוא [MATH]X = ${mean} + (${z.toFixed(2)}) \\cdot ${stdDev} = ${calculatedX.toFixed(2)}[/MATH].`);
      } else if (inverseType === 'between') {
        // Area strictly in the middle is inverseProb. Tails combined are (1 - inverseProb). Individual tail is (1-inverseProb)/2
        const tailArea = (1 - inverseProb) / 2;
        const lowerZ = inverseNormalCDF(tailArea);
        const upperZ = -lowerZ;
        const lowerX = mean + lowerZ * stdDev;
        const upperX = mean + upperZ * stdDev;
        steps.push(`מבוקש שטח מרכזי סימטרי של [MATH]p = ${inverseProb}[/MATH]. המשמעות היא שכל אחד משני הזנבות בקצוות מחזיק שטח של [MATH]\\frac{1 - ${inverseProb}}{2} = ${tailArea.toFixed(4)}[/MATH].`);
        steps.push(`ציון תקן לגבול התחתון: [MATH]Z_{Lower} = \\Phi^{-1}(${tailArea.toFixed(4)}) = ${lowerZ.toFixed(4)}[/MATH]`);
        steps.push(`ציון תקן לגבול העליון: [MATH]Z_{Upper} = ${upperZ.toFixed(4)}[/MATH]`);
        steps.push(`שלב 3 | המרה חזרה לשני ערכי ה-X | המרה חזרה לשני ערכי ה-X המקוריים בקצוות:`);
        steps.push(`[MATH]X_{Lower} = ${mean} + (${lowerZ.toFixed(2)}) \\cdot ${stdDev} = ${lowerX.toFixed(2)}[/MATH]`);
        steps.push(`[MATH]X_{Upper} = ${mean} + (${upperZ.toFixed(2)}) \\cdot ${stdDev} = ${upperX.toFixed(2)}[/MATH]`);
        steps.push(`תוצאה סופית: הטווח הכלוא המבוקש הינו בדיוק [MATH]X \\in [${lowerX.toFixed(2)}, ${upperX.toFixed(2)}][/MATH].`);

        return {
          probability: inverseProb,
          z1: lowerZ,
          z2: upperZ,
          calculatedX: lowerX, // reference point
          steps
        };
      } else {
        // Area outside is inverseProb. Middle is 1 - inverseProb. Individual tail is inverseProb/2
        const tailArea = inverseProb / 2;
        const lowerZ = inverseNormalCDF(tailArea);
        const upperZ = -lowerZ;
        const lowerX = mean + lowerZ * stdDev;
        const upperX = mean + upperZ * stdDev;
        steps.push(`מבוקש שחלקם המשותף של שני הזנבות החיצוניים יהיה [MATH]p = ${inverseProb}[/MATH], מה שאומר שכל זנב לבדו מחזיק שטח של [MATH]\\frac{${inverseProb}}{2} = ${tailArea.toFixed(4)}[/MATH].`);
        steps.push(`ציון תקן לגבול התחתון: [MATH]Z_{Lower} = \\Phi^{-1}(${tailArea.toFixed(4)}) = ${lowerZ.toFixed(4)}[/MATH]`);
        steps.push(`ציון תקן לגבול העליון: [MATH]Z_{Upper} = ${upperZ.toFixed(4)}[/MATH]`);
        steps.push(`שלב 3 | המרת ערכי ה-Z חזרה לערכי X | המרת ערכי ה-Z חזרה לערכי X:`);
        steps.push(`[MATH]X_{Lower} = ${mean} + (${lowerZ.toFixed(2)}) \\cdot ${stdDev} = ${lowerX.toFixed(2)}[/MATH]`);
        steps.push(`[MATH]X_{Upper} = ${mean} + (${upperZ.toFixed(2)}) \\cdot ${stdDev} = ${upperX.toFixed(2)}[/MATH]`);
        steps.push(`תוצאה סופית: הטווח החיצוני המבוקש הוא [MATH]X \\le ${lowerX.toFixed(2)}[/MATH] או [MATH]X \\ge ${upperX.toFixed(2)}[/MATH].`);

        return {
          probability: inverseProb,
          z1: lowerZ,
          z2: upperZ,
          calculatedX: lowerX,
          steps
        };
      }

      return {
        probability: inverseProb,
        z1: z,
        calculatedX,
        steps
      };
    }
  }, [mean, stdDev, x1, x2, condX1, condX2, condType, condTypeA, inverseProb, inverseType, forwardType, isValid, mode]);

  // Chart parameters helpers
  const chartX1 = useMemo(() => {
    if (mode === 'forward') return x1;
    if (!calculation || calculation.calculatedX === undefined) return mean;
    return calculation.calculatedX;
  }, [mode, x1, calculation, mean]);

  const chartX2 = useMemo(() => {
    if (mode === 'forward') return x2;
    // Symmetric inverse returns lower boundary in calculatedX, let's extrapolate upper
    if (inverseType === 'between' || inverseType === 'outside') {
      if (calculation && calculation.z2 !== undefined) {
        return mean + calculation.z2 * stdDev;
      }
    }
    return mean;
  }, [mode, x2, inverseType, calculation, mean, stdDev]);

  const chartProb = useMemo(() => {
    return calculation ? calculation.probability : 0;
  }, [calculation]);

  const calculatorMode = mode === 'inverse' ? 'inverse' : 'forward';
  const heroCopy = getCalculatorHeroCopy(calculatorMode);
  const hasSecondaryBoundInput =
    mode === 'forward'
      ? forwardType === 'between' || forwardType === 'outside' || (forwardType === 'conditional' && condTypeA === 'between')
      : inverseType === 'between' || inverseType === 'outside';
  const secondaryInputLabel =
    mode === 'forward'
      ? forwardType === 'conditional'
        ? 'ערך מאורע:'
        : 'גבול תחום עליון:'
      : inverseType === 'between'
        ? 'גבול עליון יעד:'
        : 'גבול זנב עליון:';
  const secondaryInputValue =
    mode === 'forward'
      ? x2Input
      : calculation && calculation.z2 !== undefined
        ? (mean + calculation.z2 * stdDev).toFixed(2)
        : '';

  const resetNormalCalculator = () => {
    setMean(100);
    setMeanInput('100');
    setStdDev(15);
    setStdDevInput('15');
    setX1(115);
    setX1Input('115');
    setX2(125);
    setX2Input('125');
    setInverseProb(0.95);
    setInverseProbInput('0.95');
    setForwardType('below');
    setInverseType('below');
    setCondType('above');
    setCondTypeA('below');
    setCondX1(110);
    setCondX1Input('110');
    setCondX2(120);
    setCondX2Input('120');
  };

  const handleCalculatorModeChange = (nextMode: CalculatorMode) => {
    if (onNavigate) {
      onNavigate(nextMode);
      return;
    }

    setMode(nextMode);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {mode === 'hypothesis' ? (
          <motion.div
            key="hypothesis"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            <HypothesisTestingCalculator />
          </motion.div>
        ) : mode === 'formula-sheet' ? (
          <motion.div
            key="formula-sheet"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            <FormulaSheet theme="dark" />
          </motion.div>
        ) : mode === 'table' ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            <PageHeader title="טבלאות התפלגות סטטיסטיות" />
            
            {/* Statistical Tables */}
            <div className="mt-8 space-y-6">
              <ZTable activeZ={calculation ? calculation.z1 : null} showSearch={true} />
              <TTable />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="calculators"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            <PageHeader title={heroCopy.title} />

            <div className="grid gap-4 sm:grid-cols-3 pt-2 mb-6">
                      {heroCopy.steps.map((step) => (
                        <div key={step.number} className="relative rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/85 p-4 text-right flex flex-col gap-2 transition-colors hover:border-[var(--color-accent-cobalt)]/50">
                          <div className="flex items-center gap-2.5 mb-1">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-cobalt)]/10 text-sm font-semibold text-[var(--color-accent-cobalt)]">
                              {step.number}
                            </div>
                            <Heading level="subsection" align="start" className="text-body-base font-bold">{step.title}</Heading>
                          </div>
                          <p className="text-body-sm leading-relaxed text-[var(--color-text-secondary)]">
                            {step.description}
                          </p>
                        </div>
                      ))}
                    </div>


            <div className="space-y-6">
              <CalculatorSidebar className="relative overflow-hidden space-y-5 text-right">
                <div className="absolute top-0 right-0 h-1 w-full bg-[var(--color-accent-cobalt-bg-hover)]" />

                <div className="relative z-10 space-y-5">
                  <div className="flex flex-col gap-3 border-b border-[var(--color-border)] pb-4 sm:flex-row sm:items-center">
                    <div className="rounded-lg bg-[var(--color-accent-cobalt-bg)]/20 p-2 text-[var(--color-accent-cobalt)]">
                      <Sliders size={20} />
                    </div>
                    <div className="flex-1 text-right">
                      <Heading level="section" data-toc id="normal-distribution-controls" className="text-lg sm:text-xl font-semibold">
                        הגדרות ופרמטרי ההתפלגות
                      </Heading>
                    </div>
                    <div className="flex w-full flex-col gap-3 sm:max-w-[28rem] sm:flex-row sm:items-center">
                      <button
                        type="button"
                        onClick={resetNormalCalculator}
                        aria-label="איפוס ערכים"
                        title="איפוס ערכים"
                        className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 text-sm font-semibold text-[var(--color-text-primary)] transition hover:border-[var(--color-accent-teal)]/50 hover:bg-[var(--color-surface)]"
                      >
                        <RefreshCw size={15} />
                        <span>איפוס ערכים</span>
                      </button>
                      <CalculatorModeSwitch
                        value={calculatorMode}
                        onChange={handleCalculatorModeChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:items-start">
                    <div className="flex flex-col gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                      <CalculationVariantPicker
                        value={mode === 'forward' ? forwardType : inverseType}
                        onChange={(nextValue) => mode === 'forward' ? setForwardType(nextValue) : setInverseType(nextValue)}
                        options={mode === 'forward' ? FORWARD_VARIANT_OPTIONS : INVERSE_VARIANT_OPTIONS}
                      />
                    </div>

                    <div className="overflow-visible rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] transition-all" dir="rtl">
                      <table className="w-full border-collapse border-spacing-0">
                        <thead>
                          <tr className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
                            <th className="relative overflow-hidden p-3.5 font-semibold text-xs sm:text-sm text-[var(--color-text-primary)] w-1/2 border-l border-[var(--color-border)]">
                              <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-12 opacity-10 pointer-events-none select-none text-4xl sm:text-5xl font-mono text-[var(--color-accent-cobalt)]">
                                <InlineMath math="N" />
                              </div>
                              <div className="relative z-10 flex items-center justify-center gap-1.5">
                                <span>פרמטרי ההתפלגות</span>
                              </div>
                            </th>
                            <th className="relative overflow-hidden p-3.5 text-center font-semibold text-xs sm:text-sm text-[var(--color-text-primary)] w-1/2">
                              <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-12 opacity-10 pointer-events-none select-none text-4xl sm:text-5xl font-mono text-[var(--color-primary)]">
                                <InlineMath math={mode === 'forward' ? 'X' : 'p'} />
                              </div>
                              <div className="relative z-10">
                                {mode === 'forward' ? 'אירוע / תחום' : 'יעד אחוזון'}
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-[var(--color-border)]">
                            <ParameterInputCell
                              watermark="\mu"
                              colorClass="text-[var(--color-accent-cobalt)]"
                              label={<><span>תוחלת (</span><InlineMath math="\mu" /><span>):</span></>}
                              tooltip="תוחלת ההתפלגות הנורמלית שממנה מתחילים את כל החישובים"
                              value={meanInput}
                              onChange={handleMeanChange}
                              error={errors.mean}
                            />
                            <ParameterInputCell
                              watermark={mode === 'forward' ? 'X_1' : 'p'}
                              colorClass="text-[var(--color-primary)]"
                              label={mode === 'forward'
                                ? <><span>{forwardType === 'conditional' ? 'ערך מאורע a₁' : forwardType === 'between' || forwardType === 'outside' ? 'גבול תחתון' : 'ערך חיתוך'} (</span><InlineMath math="X_1" /><span>):</span></>
                                : <><span>הסתברות יעד (</span><InlineMath math="p" /><span>):</span></>}
                              tooltip={mode === 'forward'
                                ? 'הערך המרכזי שמגדיר את נקודת החיתוך או את תחילת התחום המבוקש'
                                : 'השטח המצטבר המבוקש שעל פיו יימצא ערך X או טווח הערכים המתאים'}
                              value={mode === 'forward' ? x1Input : inverseProbInput}
                              onChange={mode === 'forward' ? handleX1Change : handleInverseProbChange}
                              error={mode === 'forward' ? errors.x1 : errors.inverseProb}
                              placeholder={mode === 'inverse' ? '0.95' : ''}
                            />
                          </tr>
                          <tr>
                            <ParameterInputCell
                              watermark="\sigma"
                              colorClass="text-[var(--color-accent-cobalt)]"
                              label={<><span>סטיית תקן (</span><InlineMath math="\sigma" /><span>):</span></>}
                              tooltip="סטיית התקן של ההתפלגות הנורמלית, שקובעת את רוחב עקומת הפעמון"
                              value={stdDevInput}
                              onChange={handleStdDevChange}
                              error={errors.stdDev}
                            />
                            <ParameterInputCell
                              watermark={hasSecondaryBoundInput ? 'X_2' : mode === 'forward' ? 'Z_1' : 'X'}
                              colorClass="text-[var(--color-primary)]"
                              label={hasSecondaryBoundInput
                                ? <><span>{secondaryInputLabel.replace(':', '')} (</span><InlineMath math="X_2" /><span>):</span></>
                                : mode === 'forward'
                                  ? <><span>ציון תקן נגזר (</span><InlineMath math="Z_1" /><span>):</span></>
                                  : <><span>ערך יעד נוכחי (</span><InlineMath math="X" /><span>):</span></>}
                              tooltip={hasSecondaryBoundInput
                                ? 'כאשר יש שני גבולות, כאן מזינים או מציגים את הגבול השני של התחום'
                                : mode === 'forward'
                                  ? 'במצבים חד-גבוליים מוצג כאן ציון התקן הנגזר מהקלט הנוכחי'
                                  : 'במצבי אחוזון חד-גבוליים זהו ערך X המחושב עבור ההסתברות שנבחרה'}
                              value={hasSecondaryBoundInput ? secondaryInputValue : mode === 'forward' ? (isValid ? ((x1 - mean) / stdDev).toFixed(2) : '') : (calculation?.calculatedX?.toFixed(2) ?? '')}
                              onChange={hasSecondaryBoundInput && mode === 'forward' ? handleX2Change : undefined}
                              error={hasSecondaryBoundInput && mode === 'forward' ? errors.x2 : undefined}
                              readOnly={!(hasSecondaryBoundInput && mode === 'forward')}
                              statusText={hasSecondaryBoundInput && mode === 'inverse' ? 'מחושב אוטומטית' : !hasSecondaryBoundInput ? 'מחושב אוטומטית' : undefined}
                            />
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <AnimatePresence>
                    {mode === 'forward' && forwardType === 'conditional' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-lg border p-4 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-surface)_3%,transparent)] border-[var(--color-accent-cobalt)]/45 bg-[linear-gradient(140deg,color-mix(in_srgb,var(--color-accent-cobalt)_14%,transparent),color-mix(in_srgb,var(--color-accent-cobalt)_5%,transparent))] shadow-[0_0_0_1px_var(--color-accent-cobalt)]">
                          <div className="mb-4 flex items-start justify-between gap-3 border-b border-[var(--color-border)] pb-3">
                            <div className="text-right">
                              <Heading level="subsection" accent="cobalt" className="text-body-base font-semibold text-[var(--color-accent-cobalt)]">
                                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                                  <span>הסתברות מותנית</span>
                                  <InlineMathToken math="P(A \mid B)" />
                                </span>
                              </Heading>
                              <p className="max-w-2xl text-body-sm leading-relaxed text-[var(--color-text-secondary)]">
                                פותרים בסדר קבוע: מגדירים קודם את עולם התנאי <InlineMathToken math="B" className="mx-1" />, אחר כך את המאורע המבוקש <InlineMathToken math="A" className="mx-1" />, ואז מחשבים <InlineMathToken math="P(A \cap B)" className="mx-1" /> ומחלקים ב־<InlineMathToken math="P(B)" className="mx-1" />.
                              </p>
                            </div>
                            <div className="h-3 w-3 rounded-full bg-[var(--color-accent-cobalt)]" />
                          </div>

                          <div className="mb-4 grid gap-2 lg:grid-cols-3">
                            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/78 p-3 text-right">
                              <p className="text-caption font-semibold tracking-[0.12em] text-[var(--chart-2)]">STEP 1</p>
                              <p className="mt-1 text-body-sm font-semibold text-[var(--color-text-primary)]">מגדירים תנאי רקע</p>
                              <p className="mt-1 text-caption text-[var(--color-text-secondary)]">
                                בוחרים את <InlineMathToken math="B" className="mx-1" /> והערכים שמייצרים את עולם החישוב.
                              </p>
                            </div>
                            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/78 p-3 text-right">
                              <p className="text-caption font-semibold tracking-[0.12em] text-[var(--color-accent-amber)]">STEP 2</p>
                              <p className="mt-1 text-body-sm font-semibold text-[var(--color-text-primary)]">מגדירים את המאורע המבוקש</p>
                              <p className="mt-1 text-caption text-[var(--color-text-secondary)]">
                                בוחרים את <InlineMathToken math="A" className="mx-1" /> באותה שפה פורמלית של תחום או זנב.
                              </p>
                            </div>
                            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/78 p-3 text-right">
                              <p className="text-caption font-semibold tracking-[0.12em] text-[var(--color-accent-cobalt)]">STEP 3</p>
                              <p className="mt-1 text-body-sm font-semibold text-[var(--color-text-primary)]">מחשבים יחס</p>
                              <p className="mt-1 text-caption text-[var(--color-text-secondary)]">
                                <InlineMathToken math="P(A \mid B)=\frac{P(A\ \cap B)}{P(B)}" />
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-3 xl:grid-cols-2">
                            <ConditionalEventDefinitionCard
                              stepNumber="STEP 1"
                              title={<>תנאי הרקע <InlineMathToken math="B" className="mr-1 text-[var(--chart-2)]" /></>}
                              description={<>בחר קודם את התחום שבתוכו עובדים. כל החישוב הסופי יתבצע רק בתוך <InlineMathToken math="B" className="mx-1 text-[var(--chart-2)]" />.</>}
                              formula="B"
                              value={condType}
                              onChange={setCondType}
                              disabled={!(mode === 'forward' && forwardType === 'conditional')}
                              accentClass="border-[var(--chart-2)]/60 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-accent-teal)_16%,transparent),color-mix(in_srgb,var(--color-accent-teal)_5%,transparent))] text-[var(--chart-2)]"
                              accentColor="var(--chart-2)"
                              variablePrefix="b"
                              expressionToneClass="border-[var(--chart-2)]/30 bg-[color-mix(in_srgb,var(--color-accent-teal)_8%,transparent)] text-[var(--chart-2)]"
                              fields={
                                condType === 'between' ? (
                                  <>
                                    <ConditionalValueField
                                      label={<>גבול תחתון <InlineMathToken math="b_1" className="mr-1" /></>}
                                      helper="תחילת תחום התנאי"
                                      value={condX1Input}
                                      onChange={handleCondX1Change}
                                      error={mode === 'forward' && forwardType === 'conditional' ? errors.condX1 : undefined}
                                      disabled={!(mode === 'forward' && forwardType === 'conditional')}
                                    />
                                    <ConditionalValueField
                                      label={<>גבול עליון <InlineMathToken math="b_2" className="mr-1" /></>}
                                      helper="סיום תחום התנאי"
                                      value={condX2Input}
                                      onChange={handleCondX2Change}
                                      error={mode === 'forward' && forwardType === 'conditional' ? errors.condX2 : undefined}
                                      disabled={!(mode === 'forward' && forwardType === 'conditional')}
                                    />
                                  </>
                                ) : (
                                  <div className="sm:col-span-2">
                                    <ConditionalValueField
                                      label={<>ערך סף <InlineMathToken math="b_1" className="mr-1" /></>}
                                      helper={condType === 'below' ? 'כל מה שמתחת לסף הזה ייחשב חלק מ־B' : 'כל מה שמעל הסף הזה ייחשב חלק מ־B'}
                                      value={condX1Input}
                                      onChange={handleCondX1Change}
                                      error={mode === 'forward' && forwardType === 'conditional' ? errors.condX1 : undefined}
                                      disabled={!(mode === 'forward' && forwardType === 'conditional')}
                                    />
                                  </div>
                                )
                              }
                            />

                            <ConditionalEventDefinitionCard
                              stepNumber="STEP 2"
                              title={<>המאורע המבוקש <InlineMathToken math="A" className="mr-1 text-[var(--color-accent-amber)]" /></>}
                              description={<>הגדר את <InlineMathToken math="A" className="mx-1 text-[var(--color-accent-amber)]" /> בצורה פורמלית. אחר כך המערכת תמצא אוטומטית את החיתוך <InlineMathToken math="A \cap B" className="mx-1 text-[var(--color-accent-cobalt)]" />.</>}
                              formula="A"
                              value={condTypeA}
                              onChange={setCondTypeA}
                              disabled={!(mode === 'forward' && forwardType === 'conditional')}
                              accentClass="border-[var(--color-accent-amber)]/60 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-accent-amber)_16%,transparent),color-mix(in_srgb,var(--color-accent-amber)_5%,transparent))] text-[var(--color-accent-amber)]"
                              accentColor="var(--color-accent-amber)"
                              variablePrefix="a"
                              expressionToneClass="border-[var(--color-accent-amber)]/30 bg-[color-mix(in_srgb,var(--color-accent-amber)_8%,transparent)] text-[var(--color-accent-amber)]"
                              fields={
                                condTypeA === 'between' ? (
                                  <>
                                    <ConditionalValueField
                                      label={<>גבול תחתון <InlineMathToken math="a_1" className="mr-1" /></>}
                                      helper="תחילת המאורע המבוקש"
                                      value={x1Input}
                                      onChange={handleX1Change}
                                      error={mode === 'forward' && forwardType === 'conditional' ? errors.x1 : undefined}
                                      disabled={!(mode === 'forward' && forwardType === 'conditional')}
                                    />
                                    <ConditionalValueField
                                      label={<>גבול עליון <InlineMathToken math="a_2" className="mr-1" /></>}
                                      helper="סיום המאורע המבוקש"
                                      value={x2Input}
                                      onChange={handleX2Change}
                                      error={mode === 'forward' && forwardType === 'conditional' ? errors.x2 : undefined}
                                      disabled={!(mode === 'forward' && forwardType === 'conditional')}
                                    />
                                  </>
                                ) : (
                                  <div className="sm:col-span-2">
                                    <ConditionalValueField
                                      label={<>ערך סף <InlineMathToken math="a_1" className="mr-1" /></>}
                                      helper={condTypeA === 'below' ? 'A הוא כל מה שנמצא מתחת לסף הזה' : 'A הוא כל מה שנמצא מעל הסף הזה'}
                                      value={x1Input}
                                      onChange={handleX1Change}
                                      error={mode === 'forward' && forwardType === 'conditional' ? errors.x1 : undefined}
                                      disabled={!(mode === 'forward' && forwardType === 'conditional')}
                                    />
                                  </div>
                                )
                              }
                            />
                          </div>

                          <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)]/55 p-3 text-right">
                            <div className="grid gap-2 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
                              <div>
                                <p className="text-caption font-bold text-[var(--color-text-secondary)]">תנאי רקע</p>
                                <p className="mt-1 text-body-sm font-semibold text-[var(--chart-2)]">
                                  <InlineMathToken math={`B = \\left\\{${getConditionalEventMath(condType, 'b')}\\right\\}`} />
                                </p>
                              </div>
                              <div className="rounded-full border border-[var(--color-border)] px-3 py-1 text-sm font-semibold text-[var(--color-accent-cobalt)]">
                                <InlineMathToken math="A \cap B" />
                              </div>
                              <div>
                                <p className="text-caption font-bold text-[var(--color-text-secondary)]">מאורע מבוקש</p>
                                <p className="mt-1 text-body-sm font-semibold text-[var(--color-accent-amber)]">
                                  <InlineMathToken math={`A = \\left\\{${getConditionalEventMath(condTypeA, 'a')}\\right\\}`} />
                                </p>
                              </div>
                            </div>
                            <p className="mt-3 text-caption leading-relaxed text-[var(--color-text-secondary)]">
                              הקריאה הרשמית היא: קודם <InlineMathToken math="P(B)" className="mx-1 text-[var(--chart-2)]" />, אחר כך <InlineMathToken math="P(A \cap B)" className="mx-1 text-[var(--color-accent-cobalt)]" />, ולבסוף היחס ביניהן.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CalculatorSidebar>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:[direction:ltr]">
                <div dir="rtl">
                  <ChartWrapper
                    className="curve-glow"
                    height={430}
                    isEmpty={!isValid}
                    emptyState={(
                      <EmptyState
                        icon={<AlertCircle className="h-8 w-8" />}
                        tone="error"
                        title="אין גרף להצגה"
                        message="הזן פרמטרים תקינים כדי לצייר מחדש את עקומת הפעמון של גאוס."
                      />
                    )}
                  >
                    <NormalChart
                      mean={mean}
                      stdDev={stdDev}
                      type={mode === 'forward' ? forwardType : inverseType}
                      x1={chartX1}
                      x2={chartX2}
                      condType={condType}
                      condTypeA={condTypeA}
                      condX1={condX1}
                      condX2={condX2}
                      mode={mode}
                    />
                  </ChartWrapper>
                </div>

                <div dir="rtl" className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6 text-right shadow-md">
                  <SectionHeader
                    title="צעדי חישוב"
                    level="section"
                    accent="brass"
                    withAccentBar={false}
                    className="items-start mb-4 text-right"
                  />

                  <div className="border-t border-[var(--color-border)] pt-4">
                    {isValid && calculation ? (
                      <div className="space-y-4">
                        {calculation.steps.map((st, sIdx) => (
                          <React.Fragment key={sIdx}>
                            <FormattedStep text={st} />
                          </React.Fragment>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        tone="muted"
                        icon={<Info className="h-6 w-6" />}
                        title="אין מסלול חישוב"
                        message="לא ניתן להציג דרך פתרון עקב שגיאות או ערכי קלט חסרים."
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
