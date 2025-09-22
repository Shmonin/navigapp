import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Textarea, Modal } from '@/components/ui';
import { CreatePageData } from '@/types/page';

const createPageSchema = z.object({
  title: z
    .string()
    .min(1, 'Название страницы обязательно')
    .max(50, 'Название не может быть длиннее 50 символов'),
  description: z
    .string()
    .max(200, 'Описание не может быть длиннее 200 символов')
    .optional()
});

interface CreatePageFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePageData) => Promise<void>;
  isLoading?: boolean;
}

export const CreatePageForm: React.FC<CreatePageFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm<CreatePageData>({
    resolver: zodResolver(createPageSchema),
    mode: 'onChange'
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data: CreatePageData) => {
    try {
      await onSubmit(data);
      handleClose();
    } catch (error) {
      // Ошибка будет обработана в родительском компоненте
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Создать новую страницу"
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Название страницы"
          placeholder="Например: Мой курс"
          error={errors.title?.message}
          {...register('title')}
          autoFocus
        />

        <Textarea
          label="Описание (необязательно)"
          placeholder="Короткое описание страницы"
          error={errors.description?.message}
          rows={3}
          {...register('description')}
        />

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
            {isLoading ? 'Создание...' : 'Создать страницу'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};