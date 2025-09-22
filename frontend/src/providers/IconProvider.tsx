import React, { createContext, useContext } from 'react';
import * as Icons from 'iconsax-react';
import { IconProps, IconName } from '@/types/icons';

interface IconContextType {
  getIcon: (name: IconName, props?: Partial<IconProps>) => React.ReactNode;
  iconRegistry: Record<string, IconName>;
}

const IconContext = createContext<IconContextType | null>(null);

const sizeMap = {
  xs: 16, sm: 20, md: 24, lg: 32, xl: 48, '2xl': 64
};

export const IconProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getIcon = (name: IconName, props: Partial<IconProps> = {}) => {
    const IconComponent = Icons[name] as React.FC<any>;
    const size = typeof props.size === 'string'
      ? sizeMap[props.size]
      : props.size || 24;

    return (
      <IconComponent
        size={size}
        color={props.color || 'var(--tg-theme-text-color)'}
        variant={props.variant || 'Linear'}
        className={props.className}
      />
    );
  };

  const iconRegistry = {
    // Навигация
    'nav.back': 'ArrowLeft',
    'nav.forward': 'ArrowRight',
    'nav.close': 'CloseCircle',
    'nav.menu': 'HambergerMenu',

    // Действия
    'action.add': 'Add',
    'action.edit': 'Edit2',
    'action.delete': 'Trash',
    'action.save': 'DocumentDownload',
    'action.share': 'Share',
    'action.search': 'SearchNormal1',

    // Контент
    'content.text': 'DocumentText',
    'content.image': 'Gallery',
    'content.video': 'VideoPlay',
    'content.link': 'Link21',

    // Статусы
    'status.success': 'TickCircle',
    'status.error': 'CloseCircle',
    'status.warning': 'InfoCircle',
    'status.loading': 'Refresh',

    // Пользователь
    'user.profile': 'Profile',
    'user.settings': 'Setting2',

    // Бизнес
    'business.analytics': 'Chart21',
    'business.money': 'MoneyRecive',
    'business.crown': 'Crown1'
  } as Record<string, IconName>;

  return (
    <IconContext.Provider value={{ getIcon, iconRegistry }}>
      {children}
    </IconContext.Provider>
  );
};

export const useIconProvider = () => {
  const context = useContext(IconContext);
  if (!context) {
    throw new Error('useIconProvider must be used within IconProvider');
  }
  return context;
};