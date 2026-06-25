import { type HTMLAttributes } from 'react';
import { bundledIcons, type IconName } from './bundled-icons';

interface IconProps extends HTMLAttributes<SVGSVGElement> {
  name: IconName;
  size?: number | string;
}

export function Icon({ name, size = 20, className = '', ...props }: IconProps) {
  const pathData = bundledIcons[name];
  if (!pathData) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <g dangerouslySetInnerHTML={{ __html: pathData }} />
    </svg>
  );
}

export type { IconName };
export { bundledIcons };
