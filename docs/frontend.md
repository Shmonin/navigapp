# Frontend Requirements: Навигапп Web App

## 1. Техническая архитектура

### 1.1 Технологический стек
- **Framework:** React 18+ с TypeScript 5.x
- **Build Tool:** Vite 5.x
- **Styling:** Tailwind CSS 3.x + CSS Modules
- **State Management:** Zustand 4.x
- **Router:** React Router 6.x
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Axios с interceptors
- **Telegram Integration:** @twa-dev/sdk
- **UI Components:** Headless UI + Custom components
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Deployment:** Vercel

### 1.2 Архитектурные принципы
- **Component-based** архитектура
- **Mobile-first** responsive design
- **Progressive Enhancement** для Telegram Mini Apps
- **Atomic Design** methodology
- **Custom Hooks** для переиспользуемой логики
- **Error Boundaries** для graceful error handling

## 2. Структура проекта

```
src/
├── components/           # Переиспользуемые компоненты
│   ├── ui/              # Базовые UI компоненты
│   ├── forms/           # Компоненты форм
│   ├── cards/           # Компоненты карточек
│   └── layout/          # Компоненты разметки
├── pages/               # Страницы приложения
├── hooks/               # Custom hooks
├── store/               # Zustand stores
├── services/            # API сервисы
├── utils/               # Утилиты
├── types/               # TypeScript типы
├── constants/           # Константы
└── assets/              # Статические ресурсы
```

## 3. Компоненты и интерфейсы

### 3.1 Основные страницы

#### 3.1.1 OnboardingScreen.tsx
Онбординг для новых пользователей

```typescript
interface OnboardingScreenProps {
  onComplete: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  illustration: string;
  action: {
    label: string;
    onClick: () => void;
  };
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  
  const steps: OnboardingStep[] = [
    {
      id: 'value',
      title: 'Создавайте навигацию для ваших каналов',
      description: 'Упростите доступ к важным материалам и курсам',
      illustration: '/illustrations/value.svg',
      action: {
        label: 'Продолжить',
        onClick: () => setCurrentStep(1)
      }
    },
    {
      id: 'instruction',
      title: 'Как заполнить страницу',
      description: 'Добавьте заголовки блоков и ссылки на посты',
      illustration: '/illustrations/instruction.svg',
      action: {
        label: 'Продолжить',
        onClick: () => setCurrentStep(2)
      }
    },
    {
      id: 'publish',
      title: 'Как опубликовать',
      description: 'Разместите ссылку в канале и закрепите сообщение',
      illustration: '/illustrations/publish.svg',
      action: {
        label: 'Создать свою страничку',
        onClick: handleComplete
      }
    }
  ];
  
  return (
    <div className="onboarding-container">
      {/* Реализация онбординга */}
    </div>
  );
};
```

#### 3.1.2 PageBuilderScreen.tsx
Мастер создания страниц

```typescript
interface PageBuilderState {
  currentStep: number;
  totalSteps: number;
  pageData: {
    title: string;
    description?: string;
    blocks: BlockData[];
  };
  isLoading: boolean;
  errors: Record<string, string>;
}

interface BlockData {
  id: string;
  type: 'vertical_list' | 'grid' | 'horizontal_scroll' | 'feed';
  title?: string;
  description?: string;
  cards: CardData[];
}

interface CardData {
  id: string;
  title: string;
  description?: string;
  iconUrl?: string;
  backgroundImageUrl?: string;
  linkUrl?: string;
  linkType: 'external' | 'internal';
  internalPageId?: string;
}

const PageBuilderScreen: React.FC = () => {
  const [state, setState] = useState<PageBuilderState>({
    currentStep: 1,
    totalSteps: 3,
    pageData: {
      title: '',
      blocks: []
    },
    isLoading: false,
    errors: {}
  });
  
  const { user } = useAuth();
  const { createPage } = usePageService();
  
  return (
    <div className="page-builder">
      <ProgressBar 
        current={state.currentStep} 
        total={state.totalSteps} 
      />
      
      {state.currentStep === 1 && (
        <TitleStep 
          value={state.pageData.title}
          onChange={(title) => updatePageData({ title })}
          onNext={() => setState(s => ({ ...s, currentStep: 2 }))}
        />
      )}
      
      {state.currentStep === 2 && (
        <CardsStep 
          blocks={state.pageData.blocks}
          onChange={(blocks) => updatePageData({ blocks })}
          onNext={() => setState(s => ({ ...s, currentStep: 3 }))}
          userLimits={getUserLimits(user)}
        />
      )}
      
      {state.currentStep === 3 && (
        <PreviewStep 
          pageData={state.pageData}
          onEdit={() => setState(s => ({ ...s, currentStep: 2 }))}
          onPublish={handlePublish}
          isLoading={state.isLoading}
        />
      )}
    </div>
  );
};
```

#### 3.1.3 PageViewScreen.tsx
Просмотр созданной страницы

```typescript
interface PageViewProps {
  pageId: string;
  isOwner: boolean;
}

const PageViewScreen: React.FC<PageViewProps> = ({ pageId, isOwner }) => {
  const { page, loading, error } = usePage(pageId);
  const { trackView, trackClick } = useAnalytics();
  
  useEffect(() => {
    if (page) {
      trackView(pageId);
    }
  }, [page, pageId]);
  
  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState error={error} />;
  if (!page) return <NotFoundState />;
  
  return (
    <div className="page-view">
      {isOwner && (
        <OwnerActions>
          <IconButton 
            icon={Settings}
            onClick={() => navigate('/profile')}
            variant="ghost"
          />
          <IconButton 
            icon={Edit}
            onClick={() => navigate(`/pages/${pageId}/edit`)}
            variant="primary"
          />
        </OwnerActions>
      )}
      
      <PageHeader 
        title={page.title}
        description={page.description}
      />
      
      <PageBlocks 
        blocks={page.blocks}
        onCardClick={(cardId) => {
          trackClick(pageId, cardId);
          // Handle navigation
        }}
      />
      
      <Footer>
        <FooterText>
          Страничка создана в приложении Навигапп
        </FooterText>
        <Button 
          variant="outline"
          onClick={() => navigate('/create')}
        >
          Создать свою страницу
        </Button>
      </Footer>
    </div>
  );
};
```

### 3.2 Компоненты карточек

#### 3.2.1 VerticalListCard.tsx

```typescript
interface VerticalListCardProps {
  title: string;
  description?: string;
  iconUrl?: string;
  onClick: () => void;
  isEditing?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const VerticalListCard: React.FC<VerticalListCardProps> = ({
  title,
  description,
  iconUrl,
  onClick,
  isEditing,
  onEdit,
  onDelete
}) => {
  const handleClick = () => {
    if (isEditing) return;
    
    // Haptic feedback
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
    
    onClick();
  };
  
  return (
    <motion.div
      className="vertical-card"
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      layout
    >
      <div className="card-content">
        {iconUrl && (
          <div className="card-icon">
            <img src={iconUrl} alt="" />
          </div>
        )}
        
        <div className="card-text">
          <h3 className="card-title">{title}</h3>
          {description && (
            <p className="card-description">{description}</p>
          )}
        </div>
        
        {isEditing && (
          <CardActions>
            <IconButton icon={Edit} onClick={onEdit} size="sm" />
            <IconButton icon={Trash} onClick={onDelete} size="sm" variant="danger" />
          </CardActions>
        )}
      </div>
    </motion.div>
  );
};
```

#### 3.2.2 GridCard.tsx (Pro версия)

```typescript
interface GridCardProps {
  title: string;
  description?: string;
  backgroundImageUrl?: string;
  onClick: () => void;
}

const GridCard: React.FC<GridCardProps> = ({
  title,
  description,
  backgroundImageUrl,
  onClick
}) => {
  return (
    <motion.div
      className="grid-card"
      style={{
        backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div className="grid-card-overlay">
        <div className="grid-card-content">
          <h3 className="grid-card-title">{title}</h3>
          {description && (
            <p className="grid-card-description">{description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
```

### 3.3 UI компоненты

#### 3.3.1 Button.tsx

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  haptic?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  haptic = true,
  children,
  onClick,
  disabled,
  className,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (haptic && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
    
    onClick?.(e);
  };
  
  const buttonClasses = cn(
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    {
      'btn--loading': isLoading,
      'btn--disabled': disabled || isLoading
    },
    className
  );
  
  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner size="sm" />}
      <span className={isLoading ? 'opacity-0' : ''}>{children}</span>
    </button>
  );
};
```

#### 3.3.2 ProgressBar.tsx

```typescript
interface ProgressBarProps {
  current: number;
  total: number;
  showSteps?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  showSteps = true
}) => {
  const progress = (current / total) * 100;
  
  return (
    <div className="progress-container">
      {showSteps && (
        <div className="progress-steps">
          {Array.from({ length: total }, (_, i) => (
            <div
              key={i}
              className={cn(
                'progress-step',
                {
                  'progress-step--completed': i + 1 < current,
                  'progress-step--current': i + 1 === current,
                  'progress-step--upcoming': i + 1 > current
                }
              )}
            >
              {i + 1}
            </div>
          ))}
        </div>
      )}
      
      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          style={{ width: `${progress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      <div className="progress-text">
        Шаг {current} из {total}
      </div>
    </div>
  );
};
```

## 4. State Management

### 4.1 Zustand Stores

#### 4.1.1 useAuthStore.ts

```typescript
interface User {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  subscriptionType: 'free' | 'pro';
  subscriptionExpiresAt?: string;
  trialUsed: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (initData: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  login: async (initData: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authService.login(initData);
      const { user, token, refreshToken } = response.data;
      
      // Сохранение токенов
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      });
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    set({
      user: null,
      isAuthenticated: false,
      error: null
    });
  },
  
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return;
    
    try {
      const response = await authService.refresh(refreshToken);
      const { token } = response.data;
      
      localStorage.setItem('token', token);
    } catch (error) {
      get().logout();
    }
  },
  
  updateProfile: async (data: Partial<User>) => {
    const response = await userService.updateProfile(data);
    set(state => ({
      user: { ...state.user!, ...response.data }
    }));
  }
}));
```

#### 4.1.2 usePagesStore.ts

```typescript
interface PageState {
  pages: Page[];
  currentPage: Page | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchPages: () => Promise<void>;
  fetchPage: (id: string) => Promise<void>;
  createPage: (data: CreatePageData) => Promise<Page>;
  updatePage: (id: string, data: UpdatePageData) => Promise<Page>;
  deletePage: (id: string) => Promise<void>;
  publishPage: (id: string) => Promise<void>;
}

const usePagesStore = create<PageState>((set, get) => ({
  pages: [],
  currentPage: null,
  isLoading: false,
  error: null,
  
  fetchPages: async () => {
    set({ isLoading: true });
    
    try {
      const response = await pageService.getPages();
      set({
        pages: response.data.pages,
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      });
    }
  },
  
  createPage: async (data: CreatePageData) => {
    const response = await pageService.createPage(data);
    const newPage = response.data;
    
    set(state => ({
      pages: [...state.pages, newPage]
    }));
    
    return newPage;
  }
  
  // ... остальные actions
}));
```

## 5. Custom Hooks

### 5.1 useTelegramWebApp.ts

```typescript
interface TelegramWebApp {
  initData: string;
  initDataUnsafe: any;
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color: string;
    text_color: string;
    hint_color: string;
    link_color: string;
    button_color: string;
    button_text_color: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  
  // Methods
  ready: () => void;
  expand: () => void;
  close: () => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  
  // Events
  onEvent: (eventType: string, eventHandler: () => void) => void;
  offEvent: (eventType: string, eventHandler: () => void) => void;
  
  // Buttons
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: () => void;
    hideProgress: () => void;
  };
  
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  
  // Haptic feedback
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
}

const useTelegramWebApp = () => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
      // Инициализация
      tg.ready();
      tg.expand();
      
      // Настройка темы
      document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color);
      document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color);
      document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color);
      document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color);
      document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color);
      document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color);
      
      setWebApp(tg);
      setIsReady(true);
    }
  }, []);
  
  const showMainButton = useCallback((text: string, onClick: () => void) => {
    if (webApp?.MainButton) {
      webApp.MainButton.setText(text);
      webApp.MainButton.show();
      webApp.MainButton.onClick(onClick);
    }
  }, [webApp]);
  
  const hideMainButton = useCallback(() => {
    webApp?.MainButton.hide();
  }, [webApp]);
  
  const showBackButton = useCallback((onClick: () => void) => {
    if (webApp?.BackButton) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(onClick);
    }
  }, [webApp]);
  
  const hideBackButton = useCallback(() => {
    webApp?.BackButton.hide();
  }, [webApp]);
  
  const hapticFeedback = useCallback((type: 'impact' | 'notification' | 'selection', style?: string) => {
    if (webApp?.HapticFeedback) {
      switch (type) {
        case 'impact':
          webApp.HapticFeedback.impactOccurred(style as any || 'medium');
          break;
        case 'notification':
          webApp.HapticFeedback.notificationOccurred(style as any || 'success');
          break;
        case 'selection':
          webApp.HapticFeedback.selectionChanged();
          break;
      }
    }
  }, [webApp]);
  
  return {
    webApp,
    isReady,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    hapticFeedback
  };
};
```

### 5.2 useSubscriptionLimits.ts

```typescript
interface SubscriptionLimits {
  maxPages: number;
  maxCardsPerPage: number;
  allowedBlockTypes: string[];
  canCreateInternalPages: boolean;
  hasAnalytics: boolean;
}

const useSubscriptionLimits = () => {
  const { user } = useAuthStore();
  
  const limits = useMemo((): SubscriptionLimits => {
    if (user?.subscriptionType === 'pro') {
      return {
        maxPages: -1, // unlimited
        maxCardsPerPage: -1, // unlimited
        allowedBlockTypes: ['vertical_list', 'grid', 'horizontal_scroll', 'feed'],
        canCreateInternalPages: true,
        hasAnalytics: true
      };
    }
    
    return {
      maxPages: 1,
      maxCardsPerPage: 8,
      allowedBlockTypes: ['vertical_list'],
      canCreateInternalPages: false,
      hasAnalytics: false
    };
  }, [user?.subscriptionType]);
  
  const checkCanCreatePage = useCallback((currentPagesCount: number): boolean => {
    return limits.maxPages === -1 || currentPagesCount < limits.maxPages;
  }, [limits.maxPages]);
  
  const checkCanAddCard = useCallback((currentCardsCount: number): boolean => {
    return limits.maxCardsPerPage === -1 || currentCardsCount < limits.maxCardsPerPage;
  }, [limits.maxCardsPerPage]);
  
  const checkCanUseBlockType = useCallback((blockType: string): boolean => {
    return limits.allowedBlockTypes.includes(blockType);
  }, [limits.allowedBlockTypes]);
  
  return {
    limits,
    checkCanCreatePage,
    checkCanAddCard,
    checkCanUseBlockType
  };
};
```

## 6. Routing и Navigation

### 6.1 Router configuration

```typescript
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/pages" replace />
      },
      {
        path: 'onboarding',
        element: <OnboardingScreen />
      },
      {
        path: 'pages',
        children: [
          {
            index: true,
            element: <PagesListScreen />
          },
          {
            path: 'create',
            element: <PageBuilderScreen />
          },
          {
            path: ':id',
            element: <PageViewScreen />
          },
          {
            path: ':id/edit',
            element: <PageEditScreen />
          }
        ]
      },
      {
        path: 'profile',
        element: <ProfileScreen />
      },
      {
        path: 'subscription',
        element: <SubscriptionScreen />
      }
    ]
  },
  {
    path: '/p/:slug',
    element: <PublicPageView />
  }
]);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};
```

### 6.2 Navigation с Telegram интеграцией

```typescript
const useNavigationWithTelegram = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showBackButton, hideBackButton } = useTelegramWebApp();
  
  useEffect(() => {
    const canGoBack = location.key !== 'default';
    
    if (canGoBack) {
      showBackButton(() => {
        navigate(-1);
      });
    } else {
      hideBackButton();
    }
  }, [location, navigate, showBackButton, hideBackButton]);
  
  return { navigate };
};
```

## 7. Forms и Validation

### 7.1 Page creation form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const pageSchema = z.object({
  title: z.string()
    .min(1, 'Название обязательно')
    .max(255, 'Название слишком длинное'),
  description: z.string()
    .max(1000, 'Описание слишком длинное')
    .optional(),
  blocks: z.array(z.object({
    type: z.enum(['vertical_list', 'grid', 'horizontal_scroll', 'feed']),
    title: z.string().max(255).optional(),
    description: z.string().max(500).optional(),
    cards: z.array(z.object({
      title: z.string().min(1, 'Название карточки обязательно').max(255),
      description: z.string().max(500).optional(),
      iconUrl: z.string().url().optional(),
      backgroundImageUrl: z.string().url().optional(),
      linkUrl: z.string().url().optional(),
      linkType: z.enum(['external', 'internal']),
      internalPageId: z.string().uuid().optional()
    })).max(50, 'Слишком много карточек')
  }))
});

type PageFormData = z.infer<typeof pageSchema>;

const PageForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: '',
      description: '',
      blocks: [{
        type: 'vertical_list',
        cards: []
      }]
    }
  });
  
  const onSubmit = async (data: PageFormData) => {
    try {
      await createPage(data);
      navigate('/pages');
    } catch (error) {
      console.error('Error creating page:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
};
```

## 8. Performance Optimization

### 8.1 Code Splitting

```typescript
// Lazy loading страниц
const OnboardingScreen = lazy(() => import('./pages/OnboardingScreen'));
const PageBuilderScreen = lazy(() => import('./pages/PageBuilderScreen'));
const PageViewScreen = lazy(() => import('./pages/PageViewScreen'));

// Suspense wrapper
const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
};
```

### 8.2 Image Optimization

```typescript
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  fallback = '/placeholder.svg'
}) => {
  const [imgSrc, setImgSrc] = useState(fallback);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImgSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      setImgSrc(fallback);
      setIsLoading(false);
    };
    img.src = src;
  }, [src, fallback]);
  
  return (
    <div className={cn('image-container', className)}>
      {isLoading && <Skeleton className="w-full h-full" />}
      <img
        src={imgSrc}
        alt={alt}
        className={cn('image', { 'opacity-0': isLoading })}
        loading="lazy"
      />
    </div>
  );
};
```

## 9. Error Handling

### 9.1 Error Boundary

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Отправка ошибки в систему мониторинга
    if (window.Telegram?.WebApp?.sendData) {
      window.Telegram.WebApp.sendData(JSON.stringify({
        type: 'error',
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      }));
    }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          resetError={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    
    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  const { hapticFeedback } = useTelegramWebApp();
  
  const handleRetry = () => {
    hapticFeedback('impact', 'light');
    resetError();
  };
  
  return (
    <div className="error-fallback">
      <div className="error-icon">
        <AlertCircle size={48} />
      </div>
      <h2>Что-то пошло не так</h2>
      <p>Произошла неожиданная ошибка. Попробуйте еще раз.</p>
      {error && (
        <details className="error-details">
          <summary>Подробности ошибки</summary>
          <pre>{error.message}</pre>
        </details>
      )}
      <Button onClick={handleRetry} variant="primary">
        Попробовать снова
      </Button>
    </div>
  );
};
```

### 9.2 API Error Handling

```typescript
interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: any;
}

const useErrorHandler = () => {
  const { hapticFeedback } = useTelegramWebApp();
  
  const handleError = useCallback((error: unknown) => {
    hapticFeedback('notification', 'error');
    
    if (error instanceof ApiError) {
      switch (error.code) {
        case 'SUBSCRIPTION_REQUIRED':
          toast.error('Эта функция доступна только в Pro версии');
          break;
        case 'LIMIT_EXCEEDED':
          toast.error('Превышен лимит для вашего тарифа');
          break;
        case 'UNAUTHORIZED':
          toast.error('Необходимо войти в систему');
          // Redirect to auth
          break;
        default:
          toast.error(error.message || 'Произошла ошибка');
      }
    } else {
      toast.error('Произошла неожиданная ошибка');
    }
  }, [hapticFeedback]);
  
  return { handleError };
};
```

## 10. Testing

### 10.1 Component Tests

```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../components/ui/Button';

describe('Button', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });
  
  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  test('disables button when loading', () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 10.2 Hook Tests

```typescript
// __tests__/hooks/useTelegramWebApp.test.ts
import { renderHook } from '@testing-library/react';
import { useTelegramWebApp } from '../hooks/useTelegramWebApp';

// Mock Telegram WebApp
const mockTelegram = {
  WebApp: {
    ready: jest.fn(),
    expand: jest.fn(),
    themeParams: {
      bg_color: '#ffffff',
      text_color: '#000000'
    },
    MainButton: {
      setText: jest.fn(),
      show: jest.fn(),
      hide: jest.fn(),
      onClick: jest.fn()
    }
  }
};

Object.defineProperty(window, 'Telegram', {
  value: mockTelegram,
  writable: true
});

describe('useTelegramWebApp', () => {
  test('initializes Telegram WebApp', () => {
    const { result } = renderHook(() => useTelegramWebApp());
    
    expect(mockTelegram.WebApp.ready).toHaveBeenCalled();
    expect(mockTelegram.WebApp.expand).toHaveBeenCalled();
    expect(result.current.isReady).toBe(true);
  });
});
```

## 11. Styling и UI

### 11.1 Tailwind CSS Configuration

```typescript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Telegram theme colors (динамически устанавливаются)
        'tg-bg': 'var(--tg-theme-bg-color, #ffffff)',
        'tg-text': 'var(--tg-theme-text-color, #000000)',
        'tg-hint': 'var(--tg-theme-hint-color, #999999)',
        'tg-link': 'var(--tg-theme-link-color, #2481cc)',
        'tg-button': 'var(--tg-theme-button-color, #2481cc)',
        'tg-button-text': 'var(--tg-theme-button-text-color, #ffffff)',
        
        // App colors
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8'
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          500: '#6b7280',
          900: '#111827'
        }
      },
      fontFamily: {
        sans: ['SF Pro Display', 'system-ui', 'sans-serif']
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)'
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.4s ease-out'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ]
};
```

### 11.2 CSS Modules для компонентов

```scss
// components/cards/VerticalListCard.module.scss
.card {
  @apply bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700;
  @apply transition-all duration-200 active:scale-98;
  @apply hover:shadow-md hover:border-gray-300;
  
  &:active {
    @apply bg-gray-50 dark:bg-gray-750;
  }
}

.cardContent {
  @apply flex items-start space-x-3;
}

.cardIcon {
  @apply w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0;
  
  img {
    @apply w-6 h-6 object-cover;
  }
}

.cardText {
  @apply flex-1 min-w-0;
}

.cardTitle {
  @apply text-base font-semibold text-tg-text mb-1 line-clamp-2;
}

.cardDescription {
  @apply text-sm text-tg-hint line-clamp-2;
}

.cardActions {
  @apply flex space-x-2 opacity-0 transition-opacity;
  
  .card:hover & {
    @apply opacity-100;
  }
}

// Responsive adjustments
@media (max-width: 640px) {
  .card {
    @apply p-3;
  }
  
  .cardIcon {
    @apply w-8 h-8;
    
    img {
      @apply w-5 h-5;
    }
  }
  
  .cardTitle {
    @apply text-sm;
  }
  
  .cardDescription {
    @apply text-xs;
  }
}
```

## 12. Accessibility

### 12.1 ARIA и семантика

```typescript
// Доступные компоненты
const AccessibleCard: React.FC<CardProps> = ({
  title,
  description,
  onClick,
  isSelected
}) => {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${title}. ${description}`}
      className="card"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <h3 id={`card-title-${id}`}>{title}</h3>
      <p aria-describedby={`card-title-${id}`}>{description}</p>
    </div>
  );
};
```

### 12.2 Focus management

```typescript
const useFocusManagement = () => {
  const focusElementRef = useRef<HTMLElement | null>(null);
  
  const setFocusElement = useCallback((element: HTMLElement | null) => {
    focusElementRef.current = element;
  }, []);
  
  const restoreFocus = useCallback(() => {
    if (focusElementRef.current) {
      focusElementRef.current.focus();
    }
  }, []);
  
  return { setFocusElement, restoreFocus };
};
```

## 13. Deployment

### 13.1 Vercel Configuration

```json
// vercel.json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "env": {
    "VITE_API_URL": "@api-url",
    "VITE_TELEGRAM_BOT_USERNAME": "@telegram-bot-username"
  },
  "build": {
    "env": {
      "VITE_API_URL": "@api-url-production",
      "VITE_TELEGRAM_BOT_USERNAME": "@telegram-bot-username-production"
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "ALLOWALL"
        },
        {
          "key": "Content-Security-Policy",
          "value": "frame-ancestors https://web.telegram.org https://t.me"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/p/:slug",
      "destination": "/index.html"
    }
  ]
}
```

### 13.2 Environment Variables

```typescript
// src/config/env.ts
interface Config {
  apiUrl: string;
  telegramBotUsername: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

export const config: Config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  telegramBotUsername: import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'navigapp_bot',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD
};

// Валидация обязательных переменных
if (!config.apiUrl) {
  throw new Error('VITE_API_URL is required');
}

if (!config.telegramBotUsername) {
  throw new Error('VITE_TELEGRAM_BOT_USERNAME is required');
}
```

## 14. Monitoring и Analytics

### 14.1 Performance Monitoring

```typescript
// src/utils/performance.ts
export const trackPageLoad = (pageName: string) => {
  const startTime = performance.now();
  
  return () => {
    const loadTime = performance.now() - startTime;
    
    // Отправка метрик в аналитику
    if (window.Telegram?.WebApp?.sendData) {
      window.Telegram.WebApp.sendData(JSON.stringify({
        type: 'performance',
        page: pageName,
        loadTime: Math.round(loadTime),
        timestamp: Date.now()
      }));
    }
  };
};

export const trackUserInteraction = (action: string, element: string) => {
  if (window.Telegram?.WebApp?.sendData) {
    window.Telegram.WebApp.sendData(JSON.stringify({
      type: 'interaction',
      action,
      element,
      timestamp: Date.now()
    }));
  }
};
```

### 14.2 Error Tracking

```typescript
// src/utils/errorTracking.ts
export const trackError = (error: Error, context?: any) => {
  const errorData = {
    type: 'error',
    message: error.message,
    stack: error.stack,
    context,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now()
  };
  
  if (window.Telegram?.WebApp?.sendData) {
    window.Telegram.WebApp.sendData(JSON.stringify(errorData));
  }
  
  console.error('Tracked error:', errorData);
};
```

## 15. Финальные рекомендации

### 15.1 Code Quality

- Использование ESLint и Prettier для единообразного кода
- Husky hooks для pre-commit проверок
- TypeScript strict mode для типобезопасности
- Jest для unit тестов и React Testing Library для интеграционных тестов

### 15.2 Performance Best Practices

- Lazy loading компонентов и изображений
- Memoization для тяжелых вычислений
- Virtual scrolling для больших списков
- Service Worker для кэширования статических ресурсов

### 15.3 Security Considerations

- Валидация всех пользовательских данных
- Санитизация HTML контента
- CSP headers для защиты от XSS
- Проверка origin для Telegram WebApp

---

*Этот документ содержит полные требования для разработки Frontend части приложения Навигапп с учетом специфики Telegram Mini Apps.*