import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode, Key } from 'react';

/**
 * Reveal — apparition au scroll (montée + fondu, direction configurable).
 * Respecte prefers-reduced-motion.
 */
export function Reveal({
  children,
  delay = 0,
  y = 36,
  x = 0,
  rotate = 0,
  className,
  once = true,
}: {
  children: ReactNode;
  key?: Key;
  delay?: number;
  y?: number;
  x?: number;
  rotate?: number;
  className?: string;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, x, rotate }}
      whileInView={{ opacity: 1, y: 0, x: 0, rotate: 0 }}
      viewport={{ once, margin: '-70px' }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * RevealText — titre révélé mot par mot avec un léger rebond.
 */
export function RevealText({
  text,
  className,
  delay = 0,
  stagger = 0.055,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const reduce = useReducedMotion();
  const words = text.split(' ');

  if (reduce) return <span className={className}>{text}</span>;

  return (
    <span className={className} style={{ display: 'inline' }}>
      {words.map((word, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}>
          <motion.span
            style={{ display: 'inline-block' }}
            initial={{ y: '110%', rotate: 4, opacity: 0 }}
            whileInView={{ y: 0, rotate: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: delay + i * stagger, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
            {i < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/**
 * Magnetic — enveloppe un élément et l'attire légèrement vers le curseur.
 */
export function Magnetic({
  children,
  strength = 0.28,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
      onMouseMove={e => {
        const el = e.currentTarget as HTMLElement;
        const rect = el.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        el.style.translate = `${dx * strength}px ${dy * strength}px`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.translate = '0px 0px';
      }}
      style={{ transition: 'translate .25s cubic-bezier(.22,1,.36,1)' }}
    >
      {children}
    </motion.div>
  );
}
