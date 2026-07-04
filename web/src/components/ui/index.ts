/**
 * Barrel for src/components/ui/
 *
 * Consumers should import from this barrel, not directly from individual
 * files. The path makes the import site look like:
 *
 *   import { InputGroup, ChartWrapper, ModeTabs } from '../components/ui';
 *
 * and lets the implementation split freely (CustomComponents, future
 * primitives, etc.) without touching call sites.
 */

export {
  // 1. InputGroup
  InputGroup,
  // 2. ChartWrapper
  ChartWrapper,
  // 3. CalculatorSidebar
  CalculatorSidebar,
  // 4. StepList
  StepList,
  // 5. ModeTabs
  ModeTabs,
  // 6. EmptyState
  EmptyState,
  // Bonus helpers
  InputTooltip,
  AnimatedDetails,
  Disclosure,
} from './CustomComponents';

export { PageLayout } from './PageLayout';
export type { PageLayoutProps } from './PageLayout';

export { TableOfContents } from './TableOfContents';

export { Card, CardHeader, CardBody } from './Card';
export type { CardProps, CardHeaderProps, CardBodyProps } from './Card';
export { Heading, SectionHeader } from './Heading';
export type { HeadingProps, HeadingLevel, SectionHeaderProps } from './Heading';

export type {
  // InputGroup
  InputGroupProps,
  InputSize,
  // ChartWrapper
  ChartWrapperProps,
  // CalculatorSidebar
  CalculatorSidebarProps,
  // StepList
  StepListProps,
  StepListItem,
  // ModeTabs
  ModeTabsProps,
  ModeTab,
  // EmptyState
  EmptyStateProps,
  EmptyStateTone,
  // InputTooltip
  InputTooltipProps,
  // Disclosure
  DisclosureProps,
} from './CustomComponents';

export { Tooltip, ChartTooltip, InputHelpTooltip } from './Tooltip';
export type { TooltipProps, TooltipPlacement, TooltipSize, ChartTooltipProps, ChartTooltipPayload, InputHelpTooltipProps } from './Tooltip';

export { FormulaBlock, CalcBlock, AlertBlock } from './FormulaBlock';
export type { FormulaBlockProps, FormulaBlockVariant, CalcBlockProps, AlertBlockProps } from './FormulaBlock';

export { ResultBlock } from './ResultBlock';
export type { ResultBlockProps } from './ResultBlock';
export { HandwrittenNote } from './HandwrittenNote';
export type { HandwrittenNoteProps } from './HandwrittenNote';

