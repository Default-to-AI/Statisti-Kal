import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { motion } from 'motion/react';
import { Button, type ButtonProps } from '../ui/Button';

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  duration = 0.55,
  distance = 26,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
}): ReactElement {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: distance }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: distance }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedBackground({
  variant = 'dots',
  color = 'rgba(250, 204, 21, 0.08)',
  secondaryColor = 'rgba(99, 102, 241, 0.1)',
  className,
}: {
  variant?: 'dots' | 'grid' | 'gradient';
  color?: string;
  secondaryColor?: string;
  className?: string;
}): ReactElement {
  if (variant === 'gradient') {
    return (
      <div className={cx('pointer-events-none absolute inset-0 overflow-hidden', className)}>
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 18% 22%, ${color}, transparent 28%), radial-gradient(circle at 78% 24%, ${secondaryColor}, transparent 30%), radial-gradient(circle at 65% 76%, rgba(46,196,182,0.12), transparent 24%)`,
          }}
          animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div
        className={cx('pointer-events-none absolute inset-0 opacity-60', className)}
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(42,47,62,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(42,47,62,0.6) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
    );
  }

  return (
    <div
      className={cx('pointer-events-none absolute inset-0 opacity-60', className)}
      style={{
        backgroundImage: 'radial-gradient(rgba(138,147,166,0.35) 0.8px, transparent 0.8px)',
        backgroundSize: '22px 22px',
      }}
    />
  );
}

export function SpotlightCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement {
  const ref = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  return (
    <div
      ref={ref}
      className={cx('relative overflow-hidden', className)}
      onMouseMove={(event) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        setPosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
      }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: active ? 1 : 0.28,
          background: `radial-gradient(420px circle at ${position.x}px ${position.y}px, rgba(250,204,21,0.14), transparent 42%)`,
        }}
      />
      {children}
    </div>
  );
}

export function MagneticButton({
  children,
  className,
  strength = 24,
  onClick,
  type = 'button',
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}): ReactElement {
  const ref = useRef<HTMLButtonElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      className={cx('rounded-xl', className)}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: 'spring', stiffness: 180, damping: 14 }}
      onMouseMove={(event) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const x = event.clientX - (rect.left + rect.width / 2);
        const y = event.clientY - (rect.top + rect.height / 2);
        setOffset({ x: x / strength, y: y / strength });
      }}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      type={type}
    >
      {children}
    </motion.button>
  );
}

export function GlowingTiltCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement {
  const ref = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState({ rx: 0, ry: 0, glowX: 50, glowY: 50, active: false });

  return (
    <motion.div
      ref={ref}
      className={cx('relative overflow-hidden rounded-[24px]', className)}
      animate={{ rotateX: state.rx, rotateY: state.ry, scale: state.active ? 1.02 : 1 }}
      transition={{ type: 'spring', stiffness: 210, damping: 18 }}
      style={{ transformStyle: 'preserve-3d' }}
      onMouseMove={(event) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const px = ((event.clientX - rect.left) / rect.width) * 100;
        const py = ((event.clientY - rect.top) / rect.height) * 100;
        setState({
          rx: -((py - 50) / 10),
          ry: (px - 50) / 10,
          glowX: px,
          glowY: py,
          active: true,
        });
      }}
      onMouseLeave={() => setState({ rx: 0, ry: 0, glowX: 50, glowY: 50, active: false })}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at ${state.glowX}% ${state.glowY}%, rgba(255,255,255,0.12), transparent 34%)`,
          opacity: state.active ? 1 : 0,
          transition: 'opacity 180ms ease',
        }}
      />
      {children}
    </motion.div>
  );
}

export function ParallaxScroll({
  children,
  className,
  speed = 0.08,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}): ReactElement {
  const ref = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const windowHeight = window.innerHeight || 1;
      const progress = 1 - rect.top / windowHeight;
      setOffset(progress * 100 * speed);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      <motion.div animate={{ y: -offset }} transition={{ type: 'tween', ease: 'linear', duration: 0.2 }}>
        {children}
      </motion.div>
    </div>
  );
}

export function AnimatedText({
  text,
  className,
  animation = 'slide',
  delay = 0,
}: {
  text: string;
  className?: string;
  animation?: 'slide' | 'fade' | 'wave';
  delay?: number;
}): ReactElement {
  if (animation === 'wave') {
    return (
      <div className={className}>
        {text.split('').map((char, index) => (
          <motion.span
            key={`${char}-${index}`}
            className="inline-block"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: delay + index * 0.025, ease: [0.22, 1, 0.36, 1] }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={animation === 'fade' ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {text}
    </motion.div>
  );
}

export function GradientButton({
  children,
  className,
  glow = true,
  ...props
}: ButtonProps & { glow?: boolean }): ReactElement {
  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="relative inline-flex">
      {glow ? (
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-[linear-gradient(90deg,var(--color-accent-cobalt),var(--color-accent-teal),var(--color-accent-brass))] opacity-55 blur-xl" />
      ) : null}
      <Button
        {...props}
        className={cx(
          'border-transparent bg-[linear-gradient(90deg,var(--color-accent-cobalt-strong),var(--color-accent-cobalt),var(--color-accent-teal))] text-white hover:brightness-110',
          className,
        )}
      >
        {children}
      </Button>
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement {
  const items = Children.toArray(children);

  return (
    <div className={className}>
      {items.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

export function ProgressStrip({
  value,
  label,
  tone = 'cobalt',
}: {
  value: number;
  label: string;
  tone?: 'cobalt' | 'teal' | 'brass';
}): ReactElement {
  const barClass = {
    cobalt: 'from-[var(--color-accent-cobalt)] to-[var(--color-accent-cobalt-strong)]',
    teal: 'from-[var(--color-accent-teal)] to-[#23a89b]',
    brass: 'from-[var(--color-accent-brass)] to-[#d39c00]',
  }[tone];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-body-xs font-black text-[var(--color-text-secondary)]">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--color-background)]">
        <motion.div
          className={cx('h-full rounded-full bg-gradient-to-r', barClass)}
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

export function HoverImageCard({
  imageSrc,
  imageAlt,
  title,
  description,
  badge,
}: {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
  badge: string;
}): ReactElement {
  return (
    <motion.article
      className="group overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)]"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
    >
      <div className="relative h-52 overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-background)]">
        <motion.img
          src={imageSrc}
          alt={imageAlt}
          className="h-full w-full object-cover object-top"
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.4 }}
        />
        <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(13,15,20,0.9))] p-4">
          <span className="inline-flex rounded-full border border-[var(--color-border)] bg-[rgba(20,23,31,0.9)] px-3 py-1 text-caption font-black text-[var(--color-accent-brass)]">
            {badge}
          </span>
        </div>
      </div>
      <div className="space-y-3 p-5">
        <h3 className="text-display-h3 text-[var(--color-text-primary)]">{title}</h3>
        <p className="text-body-sm font-semibold text-[var(--color-text-secondary)]">{description}</p>
      </div>
    </motion.article>
  );
}

export function PlaceholderCard({
  title,
  body,
  label = 'חסר תוכן',
}: {
  title: string;
  body: string;
  label?: string;
}): ReactElement {
  return (
    <div className="rounded-[24px] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/55 p-5">
      <span className="inline-flex rounded-full border border-[var(--color-accent-crimson)]/40 bg-[var(--color-accent-crimson)]/10 px-3 py-1 text-caption font-black text-[var(--color-accent-crimson)]">
        {label}
      </span>
      <h3 className="mt-4 text-heading-section font-black text-[var(--color-text-primary)]">{title}</h3>
      <p className="mt-2 text-body-sm font-semibold text-[var(--color-text-secondary)]">{body}</p>
    </div>
  );
}

export function SimpleTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: Array<{ id: string; label: string }>;
  active: string;
  onChange: (id: string) => void;
}): ReactElement {
  return (
    <div className="inline-flex flex-wrap gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/80 p-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cx(
            'rounded-full px-4 py-2 text-body-xs font-black transition-all',
            active === tab.id
              ? 'bg-[linear-gradient(90deg,var(--color-accent-cobalt),var(--color-accent-teal))] text-white'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-primary)]',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
