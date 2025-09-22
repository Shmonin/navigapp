import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Textarea, Modal, Icon } from '@/components/ui';
import { IconSelector } from './IconSelector';
import { CreateCardData } from '@/types/page';
import { IconName } from '@/types/icons';
import { cn } from '@/utils/cn';

const createCardSchema = z.object({
  title: z
    .string()
    .min(1, 'Название карточки обязательно')
    .max(50, 'Название не может быть длиннее 50 символов'),
  description: z
    .string()
    .max(100, 'Описание не может быть длиннее 100 символов')
    .optional(),
  url: z
    .string()
    .min(0)
    .refine((val) => {
      if (!val || val === '') return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, 'Введите корректную ссылку')
    .optional(),
  type: z.enum(['external', 'internal']),
  iconName: z.string().optional(),
  iconUrl: z.string().optional()
});

interface CreateCardFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCardData) => Promise<void>;
  isLoading?: boolean;
  maxCards?: number;
  currentCardCount?: number;
}

export const CreateCardForm: React.FC<CreateCardFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  maxCards,
  currentCardCount = 0
}) => {
  const [showIconSelector, setShowIconSelector] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
    reset
  } = useForm<CreateCardData & { iconName?: string }>({
    resolver: zodResolver(createCardSchema),
    mode: 'onChange',
    defaultValues: {
      type: 'external'
    }
  });

  console.log('🔥 Form state:', { errors, isValid });

  const selectedIconName = watch('iconName');
  const cardType = watch('type');

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleIconSelect = (iconName: IconName) => {
    setValue('iconName', iconName, { shouldValidate: true });
  };

  const handleFormSubmit = async (data: CreateCardData & { iconName?: string }) => {
    console.log('🔥 CreateCardForm handleFormSubmit called with data:', data);

    // Проверяем лимит карточек
    if (maxCards && currentCardCount >= maxCards) {
      console.log('🔥 Card limit reached, returning early');
      return;
    }

    try {
      const submitData: CreateCardData = {
        title: data.title,
        description: data.description,
        url: data.url || undefined,
        type: data.type,
        iconName: data.iconName as IconName | undefined
      };

      console.log('🔥 Prepared submit data:', submitData);
      console.log('🔥 Calling onSubmit with data...');

      await onSubmit(submitData);

      console.log('🔥 onSubmit completed successfully');
      console.log('🔥 Calling handleClose...');

      handleClose();

      console.log('🔥 handleClose completed');
    } catch (error) {
      console.error('🔥 Error in CreateCardForm handleFormSubmit:', error);
      console.error('🔥 Error details:', error instanceof Error ? error.message : String(error));
      // Ошибка будет обработана в родительском компоненте
    }
  };

  const isLimitReached = maxCards && currentCardCount >= maxCards;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Добавить карточку"
        size="md"
      >
        {isLimitReached ? (
          <div className="text-center py-8">
            <div className="mb-4">
              <Icon name="InfoCircle" size="xl" color="var(--tg-theme-hint-color)" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--tg-theme-text-color)] mb-2">
              Достигнут лимит карточек
            </h3>
            <p className="text-[var(--tg-theme-hint-color)] mb-6">
              В бесплатной версии можно создать максимум {maxCards} карточек.
              Обновитесь до Pro для неограниченного количества.
            </p>
            <Button
              variant="primary"
              onClick={handleClose}
              fullWidth
            >
              Понятно
            </Button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              console.log('🔥 Form onSubmit event triggered');
              console.log('🔥 Form data:', new FormData(e.currentTarget));
              handleSubmit(handleFormSubmit)(e);
            }}
            className="space-y-4"
          >
            {/* Иконка */}
            <div>
              <label className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-2">
                Иконка (необязательно)
              </label>
              <button
                type="button"
                className={cn(
                  'w-full p-4 border-2 border-dashed rounded-lg transition-colors',
                  'hover:border-[var(--tg-theme-button-color)]',
                  selectedIconName
                    ? 'border-[var(--tg-theme-button-color)] bg-[var(--tg-theme-button-color)]/5'
                    : 'border-[var(--tg-theme-section-separator-color)]'
                )}
                onClick={() => setShowIconSelector(true)}
              >
                {selectedIconName ? (
                  <div className="flex items-center justify-center gap-3">
                    <Icon name={selectedIconName as IconName} size="lg" />
                    <span className="text-[var(--tg-theme-text-color)]">
                      {selectedIconName}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-[var(--tg-theme-hint-color)]">
                    <Icon name="Add" size="md" />
                    <span>Выбрать иконку</span>
                  </div>
                )}
              </button>
            </div>

            {/* Название */}
            <Input
              label="Название карточки"
              placeholder="Например: Главная страница"
              error={errors.title?.message}
              {...register('title')}
              autoFocus
            />

            {/* Описание */}
            <Textarea
              label="Описание (необязательно)"
              placeholder="Короткое описание"
              error={errors.description?.message}
              rows={2}
              {...register('description')}
            />

            {/* Тип карточки */}
            <div>
              <label className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-2">
                Тип карточки
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <>
                      <button
                        type="button"
                        className={cn(
                          'p-3 border rounded-lg text-left transition-all',
                          field.value === 'external'
                            ? 'border-[var(--tg-theme-button-color)] bg-[var(--tg-theme-button-color)]/10'
                            : 'border-[var(--tg-theme-section-separator-color)]'
                        )}
                        onClick={() => field.onChange('external')}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon name="Link21" size="sm" />
                          <span className="font-medium">Ссылка</span>
                        </div>
                        <p className="text-xs text-[var(--tg-theme-hint-color)]">
                          Внешняя ссылка
                        </p>
                      </button>

                      <button
                        type="button"
                        className={cn(
                          'p-3 border rounded-lg text-left transition-all opacity-50 cursor-not-allowed',
                          'border-[var(--tg-theme-section-separator-color)]'
                        )}
                        disabled
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon name="DocumentText" size="sm" />
                          <span className="font-medium">Страница</span>
                          <Icon name="Crown1" size="xs" />
                        </div>
                        <p className="text-xs text-[var(--tg-theme-hint-color)]">
                          Внутренняя страница (Pro)
                        </p>
                      </button>
                    </>
                  )}
                />
              </div>
            </div>

            {/* URL для внешних ссылок */}
            {cardType === 'external' && (
              <Input
                label="Ссылка"
                placeholder="https://example.com"
                error={errors.url?.message}
                leftIcon="Link21"
                {...register('url')}
              />
            )}

            {/* Счетчик карточек */}
            {maxCards && (
              <div className="text-xs text-[var(--tg-theme-hint-color)] text-center p-2 bg-[var(--tg-theme-secondary-bg-color)] rounded">
                Карточек: {currentCardCount + 1}/{maxCards}
              </div>
            )}

            {/* Действия */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                fullWidth
                disabled={isLoading}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                disabled={!isValid || isLoading}
              >
                {isLoading ? 'Добавление...' : 'Добавить карточку'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Селектор иконок */}
      <IconSelector
        isOpen={showIconSelector}
        onClose={() => setShowIconSelector(false)}
        onSelect={handleIconSelect}
        selectedIcon={selectedIconName as IconName}
      />
    </>
  );
};