import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * Curseur personnalisé Swap : point tricolore + halo élastique qui suit la souris.
 * Désactivé sur écrans tactiles (pointer: coarse) pour ne pas gêner.
 */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const haloX = useSpring(x, { stiffness: 260, damping: 24, mass: 0.6 });
  const haloY = useSpring(y, { stiffness: 260, damping: 24, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine) return;
    setEnabled(true);
    document.documentElement.classList.add('cursor-none-desktop');

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = e.target as HTMLElement;
      setHovering(Boolean(target.closest('a, button, input, textarea, select, [data-cursor]')));
    };
    window.addEventListener('mousemove', move, { passive: true });
    return () => {
      window.removeEventListener('mousemove', move);
      document.documentElement.classList.remove('cursor-none-desktop');
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* Halo élastique tricolore */}
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 z-[9998] pointer-events-none rounded-full"
        style={{
          x: haloX,
          y: haloY,
          translateX: '-50%',
          translateY: '-50%',
          width: hovering ? 52 : 34,
          height: hovering ? 52 : 34,
          border: '2px solid var(--yellow-500)',
          background: hovering ? 'rgba(255,199,44,0.14)' : 'transparent',
          transition: 'width .2s ease, height .2s ease, background .2s ease',
        }}
      />
      {/* Point central */}
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 z-[9999] pointer-events-none rounded-full"
        style={{
          x, y,
          translateX: '-50%',
          translateY: '-50%',
          width: 9,
          height: 9,
          background: 'var(--tri-gradient)',
        }}
      />
    </>
  );
}
