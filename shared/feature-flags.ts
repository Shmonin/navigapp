/**
 * Feature Flags Configuration
 *
 * Controls the rollout of new features and enables A/B testing.
 * Environment variables take precedence over default values.
 */

export interface FeatureFlags {
  // New authentication system
  NEW_AUTH_SYSTEM: boolean;
  BOT_AUTH_ENABLED: boolean;
  WEBAPP_AUTH_FALLBACK: boolean;
  LONG_LIVED_TOKENS: boolean;

  // Public pages
  PUBLIC_PAGES_ENABLED: boolean;
  PUBLIC_SEO_META: boolean;
  PUBLIC_ANALYTICS: boolean;

  // Migration and compatibility
  PARALLEL_AUTH_SYSTEMS: boolean;
  AUTO_MIGRATION: boolean;
  LEGACY_API_SUPPORT: boolean;

  // Development and debugging
  DEBUG_AUTH_FLOW: boolean;
  VERBOSE_LOGGING: boolean;
  DEV_MODE: boolean;

  // Performance and caching
  TOKEN_AUTO_REFRESH: boolean;
  PUBLIC_PAGE_CACHING: boolean;
  CDN_ENABLED: boolean;

  // UI/UX Features
  ENHANCED_ONBOARDING: boolean;
  DARK_MODE: boolean;
  MOBILE_OPTIMIZATIONS: boolean;
}

/**
 * Default feature flag values
 */
const DEFAULT_FLAGS: FeatureFlags = {
  // New auth system - gradual rollout
  NEW_AUTH_SYSTEM: false,
  BOT_AUTH_ENABLED: false,
  WEBAPP_AUTH_FALLBACK: true,
  LONG_LIVED_TOKENS: false,

  // Public pages - ready for production
  PUBLIC_PAGES_ENABLED: true,
  PUBLIC_SEO_META: true,
  PUBLIC_ANALYTICS: true,

  // Migration - controlled rollout
  PARALLEL_AUTH_SYSTEMS: true,
  AUTO_MIGRATION: false,
  LEGACY_API_SUPPORT: true,

  // Development
  DEBUG_AUTH_FLOW: false,
  VERBOSE_LOGGING: false,
  DEV_MODE: false,

  // Performance
  TOKEN_AUTO_REFRESH: true,
  PUBLIC_PAGE_CACHING: true,
  CDN_ENABLED: false,

  // UI/UX
  ENHANCED_ONBOARDING: true,
  DARK_MODE: false,
  MOBILE_OPTIMIZATIONS: true,
};

/**
 * Get environment-specific feature flags
 */
function getEnvironmentFlags(): Partial<FeatureFlags> {
  // Browser environment
  if (typeof window !== 'undefined') {
    return {
      DEV_MODE: window.location.hostname === 'localhost',
      DEBUG_AUTH_FLOW: window.location.search.includes('debug=true'),
      VERBOSE_LOGGING: window.location.search.includes('verbose=true'),
    };
  }

  // Node.js/Deno environment
  if (typeof process !== 'undefined' && process.env) {
    return {
      NEW_AUTH_SYSTEM: process.env.ENABLE_NEW_AUTH === 'true',
      BOT_AUTH_ENABLED: process.env.ENABLE_BOT_AUTH === 'true',
      WEBAPP_AUTH_FALLBACK: process.env.ENABLE_WEBAPP_FALLBACK !== 'false',
      LONG_LIVED_TOKENS: process.env.ENABLE_LONG_TOKENS === 'true',

      PUBLIC_PAGES_ENABLED: process.env.ENABLE_PUBLIC_PAGES !== 'false',
      PUBLIC_SEO_META: process.env.ENABLE_SEO_META !== 'false',
      PUBLIC_ANALYTICS: process.env.ENABLE_PUBLIC_ANALYTICS !== 'false',

      PARALLEL_AUTH_SYSTEMS: process.env.ENABLE_PARALLEL_AUTH !== 'false',
      AUTO_MIGRATION: process.env.ENABLE_AUTO_MIGRATION === 'true',
      LEGACY_API_SUPPORT: process.env.ENABLE_LEGACY_API !== 'false',

      DEBUG_AUTH_FLOW: process.env.DEBUG_AUTH === 'true',
      VERBOSE_LOGGING: process.env.VERBOSE_LOGGING === 'true',
      DEV_MODE: process.env.NODE_ENV === 'development',

      TOKEN_AUTO_REFRESH: process.env.DISABLE_AUTO_REFRESH !== 'true',
      PUBLIC_PAGE_CACHING: process.env.DISABLE_CACHING !== 'true',
      CDN_ENABLED: process.env.ENABLE_CDN === 'true',

      ENHANCED_ONBOARDING: process.env.DISABLE_ENHANCED_ONBOARDING !== 'true',
      DARK_MODE: process.env.ENABLE_DARK_MODE === 'true',
      MOBILE_OPTIMIZATIONS: process.env.DISABLE_MOBILE_OPT !== 'true',
    };
  }

  // Deno environment
  if (typeof Deno !== 'undefined') {
    return {
      NEW_AUTH_SYSTEM: Deno.env.get('ENABLE_NEW_AUTH') === 'true',
      BOT_AUTH_ENABLED: Deno.env.get('ENABLE_BOT_AUTH') === 'true',
      WEBAPP_AUTH_FALLBACK: Deno.env.get('ENABLE_WEBAPP_FALLBACK') !== 'false',
      LONG_LIVED_TOKENS: Deno.env.get('ENABLE_LONG_TOKENS') === 'true',

      PUBLIC_PAGES_ENABLED: Deno.env.get('ENABLE_PUBLIC_PAGES') !== 'false',
      PUBLIC_SEO_META: Deno.env.get('ENABLE_SEO_META') !== 'false',
      PUBLIC_ANALYTICS: Deno.env.get('ENABLE_PUBLIC_ANALYTICS') !== 'false',

      PARALLEL_AUTH_SYSTEMS: Deno.env.get('ENABLE_PARALLEL_AUTH') !== 'false',
      AUTO_MIGRATION: Deno.env.get('ENABLE_AUTO_MIGRATION') === 'true',
      LEGACY_API_SUPPORT: Deno.env.get('ENABLE_LEGACY_API') !== 'false',

      DEBUG_AUTH_FLOW: Deno.env.get('DEBUG_AUTH') === 'true',
      VERBOSE_LOGGING: Deno.env.get('VERBOSE_LOGGING') === 'true',
      DEV_MODE: Deno.env.get('DENO_ENV') === 'development',

      TOKEN_AUTO_REFRESH: Deno.env.get('DISABLE_AUTO_REFRESH') !== 'true',
      PUBLIC_PAGE_CACHING: Deno.env.get('DISABLE_CACHING') !== 'true',
      CDN_ENABLED: Deno.env.get('ENABLE_CDN') === 'true',

      ENHANCED_ONBOARDING: Deno.env.get('DISABLE_ENHANCED_ONBOARDING') !== 'true',
      DARK_MODE: Deno.env.get('ENABLE_DARK_MODE') === 'true',
      MOBILE_OPTIMIZATIONS: Deno.env.get('DISABLE_MOBILE_OPT') !== 'true',
    };
  }

  return {};
}

/**
 * Merge default flags with environment-specific overrides
 */
function createFeatureFlags(): FeatureFlags {
  const envFlags = getEnvironmentFlags();

  // Filter out undefined values
  const cleanEnvFlags = Object.fromEntries(
    Object.entries(envFlags).filter(([_, value]) => value !== undefined)
  );

  return {
    ...DEFAULT_FLAGS,
    ...cleanEnvFlags,
  } as FeatureFlags;
}

/**
 * Global feature flags instance
 */
export const FeatureFlags = createFeatureFlags();

/**
 * Utility functions for feature flag management
 */
export class FeatureFlagManager {
  private static flags = FeatureFlags;

  /**
   * Check if a feature is enabled
   */
  static isEnabled(flag: keyof FeatureFlags): boolean {
    return this.flags[flag] === true;
  }

  /**
   * Check if any of the specified features are enabled
   */
  static isAnyEnabled(...flags: (keyof FeatureFlags)[]): boolean {
    return flags.some(flag => this.isEnabled(flag));
  }

  /**
   * Check if all of the specified features are enabled
   */
  static isAllEnabled(...flags: (keyof FeatureFlags)[]): boolean {
    return flags.every(flag => this.isEnabled(flag));
  }

  /**
   * Get the current value of a feature flag
   */
  static getValue<K extends keyof FeatureFlags>(flag: K): FeatureFlags[K] {
    return this.flags[flag];
  }

  /**
   * Override a feature flag (for testing or runtime configuration)
   */
  static override(flag: keyof FeatureFlags, value: boolean): void {
    this.flags[flag] = value;
  }

  /**
   * Reset all overrides to environment defaults
   */
  static reset(): void {
    this.flags = createFeatureFlags();
  }

  /**
   * Get all current feature flag values
   */
  static getAll(): FeatureFlags {
    return { ...this.flags };
  }

  /**
   * Log current feature flag state (for debugging)
   */
  static debug(): void {
    if (this.isEnabled('DEBUG_AUTH_FLOW') || this.isEnabled('VERBOSE_LOGGING')) {
      console.log('🚩 Feature Flags:', this.flags);
    }
  }
}

/**
 * React Hook for feature flags (if using in React)
 */
export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  return FeatureFlagManager.isEnabled(flag);
}

/**
 * Conditional execution based on feature flags
 */
export function withFeatureFlag<T>(
  flag: keyof FeatureFlags,
  enabledValue: T,
  disabledValue: T
): T {
  return FeatureFlagManager.isEnabled(flag) ? enabledValue : disabledValue;
}

/**
 * Migration-specific feature flags for auth system rollout
 */
export const MigrationFlags = {
  /**
   * Phase 1: Infrastructure ready
   */
  canUseBotAuth: () => FeatureFlagManager.isAllEnabled('NEW_AUTH_SYSTEM', 'BOT_AUTH_ENABLED'),

  /**
   * Phase 2: Public pages ready
   */
  canUsePublicPages: () => FeatureFlagManager.isEnabled('PUBLIC_PAGES_ENABLED'),

  /**
   * Phase 3: Full migration
   */
  shouldAutoMigrate: () => FeatureFlagManager.isAllEnabled('AUTO_MIGRATION', 'NEW_AUTH_SYSTEM'),

  /**
   * Phase 4: Legacy cleanup
   */
  shouldKeepLegacyAPI: () => FeatureFlagManager.isEnabled('LEGACY_API_SUPPORT'),

  /**
   * Development helpers
   */
  shouldDebugAuth: () => FeatureFlagManager.isAnyEnabled('DEBUG_AUTH_FLOW', 'VERBOSE_LOGGING', 'DEV_MODE'),
} as const;