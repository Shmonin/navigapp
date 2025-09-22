import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { Icon, Button, Modal, Input } from '@/components/ui';
import { IconName } from '@/types/icons';

// Популярные иконки для навигации
const popularIcons: IconName[] = [
  'Home2', 'Profile', 'Message', 'Setting2', 'Document', 'Gallery',
  'Video', 'Music', 'Heart', 'Star1', 'Location', 'Calendar1',
  'Clock', 'Money4', 'Card', 'ShoppingCart', 'Bag2', 'Gift',
  'Book1', 'Teacher', 'PresentionChart', 'Chart21',
  'Mobile', 'Monitor', 'Game', 'Camera', 'Microphone2',
  'Headphone', 'Wifi', 'Bluetooth', 'BatteryFull', 'Trash'
];

// Категории иконок
const iconCategories = {
  popular: { name: 'Популярные', icons: popularIcons },
  business: {
    name: 'Бизнес',
    icons: ['Briefcase', 'MoneyRecive', 'Chart21', 'TrendUp', 'Award', 'Crown1', 'Target'] as IconName[]
  },
  education: {
    name: 'Обучение',
    icons: ['Book1', 'Teacher', 'PresentionChart', 'DocumentText', 'Edit2', 'Archive'] as IconName[]
  },
  tech: {
    name: 'Технологии',
    icons: ['Mobile', 'Monitor', 'Code1', 'Data', 'CloudAdd', 'SecuritySafe'] as IconName[]
  },
  social: {
    name: 'Соцсети',
    icons: ['Message', 'MessageText1', 'Call', 'VideoHorizontal', 'Share', 'Like1'] as IconName[]
  }
};

interface IconSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconName: IconName) => void;
  selectedIcon?: IconName;
}

export const IconSelector: React.FC<IconSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedIcon
}) => {
  const [activeCategory, setActiveCategory] = useState<keyof typeof iconCategories>('popular');
  const [searchQuery, setSearchQuery] = useState('');

  const handleIconSelect = (iconName: IconName) => {
    onSelect(iconName);
    onClose();
  };

  const filteredIcons = React.useMemo(() => {
    const categoryIcons = iconCategories[activeCategory].icons;
    if (!searchQuery) return categoryIcons;

    return categoryIcons.filter(icon =>
      icon.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeCategory, searchQuery]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Выберите иконку"
      size="lg"
    >
      <div className="space-y-4">
        {/* Поиск */}
        <Input
          placeholder="Поиск иконок..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon="SearchNormal1"
        />

        {/* Категории */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Object.entries(iconCategories).map(([key, category]) => (
            <button
              key={key}
              className={cn(
                'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                activeCategory === key
                  ? 'bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)]'
                  : 'bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)] hover:bg-[var(--tg-theme-section-separator-color)]'
              )}
              onClick={() => setActiveCategory(key as keyof typeof iconCategories)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Сетка иконок */}
        <div className="grid grid-cols-6 gap-3 max-h-80 overflow-y-auto">
          {filteredIcons.map((iconName) => (
            <button
              key={iconName}
              className={cn(
                'p-3 rounded-lg border-2 transition-all hover:shadow-sm',
                selectedIcon === iconName
                  ? 'border-[var(--tg-theme-button-color)] bg-[var(--tg-theme-button-color)]/10'
                  : 'border-[var(--tg-theme-section-separator-color)] hover:border-[var(--tg-theme-hint-color)]'
              )}
              onClick={() => handleIconSelect(iconName)}
              title={iconName}
            >
              <Icon
                name={iconName}
                size="lg"
                variant={selectedIcon === iconName ? 'Bold' : 'Linear'}
              />
            </button>
          ))}
        </div>

        {/* Действия */}
        <div className="flex gap-3 pt-4 border-t border-[var(--tg-theme-section-separator-color)]">
          <Button
            variant="secondary"
            onClick={onClose}
            fullWidth
          >
            Отмена
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              onSelect(null as any); // Убрать иконку
              onClose();
            }}
            fullWidth
          >
            Убрать иконку
          </Button>
        </div>
      </div>
    </Modal>
  );
};