import * as Icons from 'iconsax-react';

export type IconName = keyof typeof Icons;
export type IconVariant = 'Linear' | 'Bold' | 'Bulk' | 'Broken' | 'TwoTone';
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;

export interface IconProps {
  name: IconName;
  variant?: IconVariant;
  size?: IconSize;
  color?: string;
  className?: string;
}