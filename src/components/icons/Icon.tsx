import { useId } from 'react';
import { KUBAI_ICONS, type KubaiIconName } from './kubai-data';

interface IconProps {
  name: KubaiIconName;
  /** Rendered size in px. The set is drawn on a 16 grid; keep to even sizes (16, 20, 24, 28). */
  size?: 16 | 20 | 24 | 28 | 32;
  className?: string;
  /** Accessible name. Omit for decorative icons, which are then hidden from assistive tech. */
  label?: string;
}

/**
 * One icon from the Kubai two-tone set. Colours come from --ki-a and --ki-b, set by a parent
 * (see the .ki-* utilities in globals.css), so the set reads on paper and on navy.
 */
export default function Icon({ name, size = 24, className, label }: IconProps) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const markup = KUBAI_ICONS[name].replaceAll('__ID__', `ki${id}`);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      width={size}
      height={size}
      className={`shrink-0 ${className ?? ''}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
