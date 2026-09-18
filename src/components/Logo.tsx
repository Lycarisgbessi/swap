import { GraduationCap } from 'lucide-react';
import { useSettings } from './SettingsProvider';

/**
 * Wordmark de la plateforme — le nom vient des paramètres (platformName),
 * ce qui permet de recustomiser la marque sans toucher au code.
 */
export default function Logo({ height = 44 }: { height?: number }) {
  const { platformName } = useSettings();
  return (
    <span className="flex items-center gap-2.5 select-none">
      <span
        className="flex items-center justify-center rounded-xl flex-shrink-0"
        style={{
          width: height,
          height,
          background: 'linear-gradient(145deg, #0B1E38, #06111F)',
          border: '1px solid rgba(201, 168, 76, 0.35)',
        }}>
        <GraduationCap
          style={{ width: height * 0.52, height: height * 0.52, color: '#C9A84C' }}
        />
      </span>
      <span
        className="font-bold tracking-tight whitespace-nowrap"
        style={{ fontSize: Math.round(height * 0.36), color: '#FFFFFF' }}>
        {platformName}
      </span>
    </span>
  );
}
