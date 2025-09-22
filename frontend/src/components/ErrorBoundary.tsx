import React from 'react';
import { ErrorMessage } from '@/components/ui';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <ErrorMessage
            title="Что-то пошло не так"
            message="Произошла непредвиденная ошибка. Попробуйте обновить страницу."
            action={{
              label: 'Обновить страницу',
              onClick: () => window.location.reload()
            }}
          />
        </div>
      );
    }

    return this.props.children;
  }
}