import { useIconProvider } from '@/providers/IconProvider';
import { IconProps, IconName } from '@/types/icons';

export const useIcon = () => {
  const { getIcon, iconRegistry } = useIconProvider();

  const getByKey = (key: string, props?: Partial<IconProps>) => {
    const iconName = iconRegistry[key];
    if (!iconName) {
      console.warn(`Icon key "${key}" not found in registry`);
      return null;
    }
    return getIcon(iconName, props);
  };

  const getByName = (name: IconName, props?: Partial<IconProps>) => {
    return getIcon(name, props);
  };

  return {
    icon: getByName,
    iconKey: getByKey,
    registry: iconRegistry
  };
};