'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import type { OnboardingStep } from './types';

interface WizardFooterProps {
  currentStep: OnboardingStep;
  canProceed: boolean;
  isLoading: boolean;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  profileCreated: boolean;
  notifSupported?: boolean;
  notifEnabled?: boolean;
  onEnableNotifications?: () => void;
  onSkipNotifications?: () => void;
}

export function WizardFooter({
  currentStep,
  canProceed,
  isLoading,
  onNext,
  onBack,
  onSkip,
  profileCreated,
  notifSupported,
  notifEnabled,
  onEnableNotifications,
  onSkipNotifications,
}: WizardFooterProps) {
  const { t } = useLanguage();

  // Determine button labels
  const isLastStep = currentStep === 'review';
  const isFirstStep = currentStep === 'welcome';
  const isOptionalStep = currentStep === 'building' || currentStep === 'household';
  const nextButtonLabel = isLastStep ? 'Create Profile' : 'Continue';

  // Show success state with notification prompt
  if (profileCreated) {
    // Notifications already enabled — show brief success
    if (notifEnabled) {
      return (
        <div className="flex-shrink-0 border-t border-gray-200 p-4 sm:p-6 bg-white">
          <div className="text-center py-4">
            <svg className="w-12 h-12 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-lg font-semibold text-gray-900">{t('notifications.onboardingSuccess')}</p>
          </div>
        </div>
      );
    }

    // Show notification prompt (or simple success if not supported)
    return (
      <div className="flex-shrink-0 border-t border-gray-200 p-4 sm:p-6 bg-white">
        <div className="text-center py-2 space-y-3">
          <svg className="w-10 h-10 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-lg font-semibold text-gray-900">Profile Created!</p>

          {notifSupported && onEnableNotifications ? (
            <>
              <div className="pt-2">
                <p className="text-sm font-medium text-gray-900">{t('notifications.onboardingTitle')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('notifications.onboardingDesc')}</p>
              </div>
              <button
                onClick={onEnableNotifications}
                className="w-full py-3 px-4 bg-rstu-red text-white font-medium rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {t('notifications.enableNow')}
                </span>
              </button>
              <button
                onClick={onSkipNotifications}
                className="w-full py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
              >
                {t('notifications.maybeLater')}
              </button>
            </>
          ) : (
            <button
              onClick={onSkipNotifications}
              className="w-full py-3 px-4 bg-rstu-red text-white font-medium rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 border-t border-gray-200 p-4 sm:p-6 bg-white space-y-3 sm:space-y-0">
      {/* Main buttons row */}
      <div className="flex gap-2 sm:gap-3">
        {/* Back button - hidden on first step */}
        {!isFirstStep && (
          <button
            onClick={onBack}
            disabled={isLoading}
            className="flex-1 py-3 sm:py-4 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
            aria-label="Go back to previous step"
          >
            <span className="hidden sm:inline">← Back</span>
            <span className="sm:hidden">Back</span>
          </button>
        )}

        {/* Next/Create button */}
        <button
          onClick={onNext}
          disabled={!canProceed || isLoading}
          className={`flex-1 py-3 sm:py-4 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base ${
            canProceed && !isLoading
              ? 'bg-rstu-red text-white hover:bg-red-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
          aria-label={isLastStep ? 'Create your profile' : 'Go to next step'}
        >
          {isLoading && (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating...
            </span>
          )}
          {!isLoading && (
            <span className="flex items-center justify-center gap-1">
              {nextButtonLabel}
              <span className="hidden sm:inline">→</span>
            </span>
          )}
        </button>
      </div>

      {/* Skip button - only for optional steps */}
      {isOptionalStep && (
        <button
          onClick={onSkip}
          disabled={isLoading}
          className="w-full py-2 sm:py-3 text-gray-500 text-sm hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Skip this step"
        >
          Skip for now →
        </button>
      )}

      {/* Mobile-only: Show step indicator */}
      <p className="text-xs text-center text-gray-400 sm:hidden mt-2">
        {currentStep === 'review' ? 'Almost done!' : 'One more step...'}
      </p>
    </div>
  );
}
