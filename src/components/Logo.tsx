import { useSettings } from './SettingsProvider';

/**
 * Logo Swap — monogramme "S" dans une pastille à dégradé tricolore
 * (vert → jaune → rouge), suivi du nom de la plateforme.
 */
export default function Logo({
  height = 44,
  light = false,
}: {
  height?: number;
  light?: boolean;
}) {
  const { platformName } = useSettings();
  const name = platformName || 'Swap';

  return (
    <span className="flex items-center gap-2.5 select-none">
      <span
        className="relative flex items-center justify-center flex-shrink-0 font-extrabold"
        style={{
          width: height,
          height,
          borderRadius: '38% 62% 55% 45% / 48% 42% 58% 52%',
          background: 'var(--tri-gradient)',
          backgroundSize: '180% auto',
          color: '#04180F',
          fontSize: height * 0.52,
          boxShadow: '0 6px 18px -6px rgba(6,40,23,.55)',
          animation: 'gradientPan 7s ease infinite',
          transform: 'rotate(-4deg)',
          transition: 'transform .3s cubic-bezier(.34,1.56,.64,1)',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'rotate(6deg) scale(1.06)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'rotate(-4deg)')}
      >
        {name.charAt(0).toUpperCase()}
      </span>
      <span
        className="font-extrabold tracking-tight whitespace-nowrap"
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: Math.round(height * 0.42),
          color: light ? '#F6FFF9' : 'var(--ink)',
        }}>
        {name}
      </span>
    </span>
  );
}
