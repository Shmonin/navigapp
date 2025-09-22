import React from 'react';
import { useIcon } from '@/hooks/useIcon';
import { IconProps } from '@/types/icons';

export const Icon: React.FC<IconProps> = (props) => {
  const { icon } = useIcon();
  return <>{icon(props.name, props)}</>;
};