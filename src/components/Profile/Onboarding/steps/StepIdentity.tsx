'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { isEmailAvailable } from '@/lib/storage/profileStorage';
import { validatePassword } from '@/lib/services/supabaseAuth';
import { getFieldError } from '../utils';
import { useLanguage } from '@/contexts/LanguageContext';
import type { OnboardingFormData, ValidateEmailResult, ValidatePasswordResult } from '../types';

interface StepIdentityProps {
  formData: OnboardingFormData;
  onFormDataChange: (data: OnboardingFormData) => void;
  onEmailValidation: (result: ValidateEmailResult) => void;
  onPasswordValidation: (result: ValidatePasswordResult) => void;
  emailValidation?: ValidateEmailResult;
  passwordValidation?: ValidatePasswordResult;
}

export function StepIdentity({
  formData,
  onFormDataChange,
  onEmailValidation,
  onPasswordValidation,
}: StepIdentityProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState(formData.email);
  const [nickname, setNickname] = useState(formData.nickname);
  const [password, setPassword] = useState(formData.password);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const emailCheckTimeout = useRef<NodeJS.Timeout | null>(null);
  const autoFocusRef = useRef<HTMLInputElement>(null);

  // Use ref to avoid stale closure issues with formData
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  // Auto-focus nickname input on mount
  useEffect(() => {
    if (autoFocusRef.current && !nickname) {
      autoFocusRef.current.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle nickname change - update local state and parent
  const handleNicknameChange = useCallback((value: string) => {
    setNickname(value);
    const error = getFieldError('nickname', value, {});
    setNicknameError(error);

    // Update parent form data
    onFormDataChange({
      ...formDataRef.current,
      nickname: value,
    });
  }, [onFormDataChange]);

  // Handle email change - update local state and trigger validation
  const handleEmailChange = useCallback((value: string) => {
    const normalizedEmail = value.toLowerCase();
    setEmail(normalizedEmail);

    // Update parent form data immediately
    onFormDataChange({
      ...formDataRef.current,
      email: normalizedEmail,
    });
  }, [onFormDataChange]);

  // Handle password change - validate and update parent
  const handlePasswordChange = useCallback((value: string) => {
    setPassword(value);

    // Validate password
    const result = validatePassword(value);
    if (result.valid) {
      setPasswordError(null);
      onPasswordValidation({ valid: true });
    } else {
      setPasswordError(result.error || null);
      onPasswordValidation({ valid: false, error: result.error });
    }

    // Update parent form data
    onFormDataChange({
      ...formDataRef.current,
      password: value,
    });
  }, [onFormDataChange, onPasswordValidation]);

  // Debounced email validation effect
  useEffect(() => {
    // Clear previous timeout
    if (emailCheckTimeout.current) {
      clearTimeout(emailCheckTimeout.current);
    }

    // Don't validate if email is empty
    if (!email) {
      setEmailError(null);
      onEmailValidation({ available: false });
      return;
    }

    // Basic format validation first
    const formatError = getFieldError('email', email, {});
    if (formatError) {
      setEmailError(formatError);
      onEmailValidation({ available: false, error: formatError });
      return;
    }

    // Debounce async validation (500ms)
    setIsValidatingEmail(true);
    emailCheckTimeout.current = setTimeout(async () => {
      try {
        const result = await isEmailAvailable(email);

        if (result.available) {
          setEmailError(null);
          onEmailValidation({ available: true });
        } else {
          const errorMsg = result.existingNickname
            ? `${t('onboarding.emailAlreadyRegisteredTo')} ${result.existingNickname}`
            : t('onboarding.emailAlreadyInUse');
          setEmailError(errorMsg);
          onEmailValidation({ available: false, error: errorMsg });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : t('onboarding.couldNotValidateEmail');
        setEmailError(message);
        onEmailValidation({ available: false, error: message });
      } finally {
        setIsValidatingEmail(false);
      }
    }, 500);

    return () => {
      if (emailCheckTimeout.current) {
        clearTimeout(emailCheckTimeout.current);
      }
    };
  }, [email, onEmailValidation]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{t('onboarding.aboutYou')}</h2>
        <p className="text-sm sm:text-base text-gray-600">
          {t('onboarding.aboutYouDesc')}
        </p>
      </div>

      {/* Nickname field */}
      <div>
        <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
          {t('onboarding.nickname')} <span className="text-rstu-red">*</span>
        </label>
        <input
          ref={autoFocusRef}
          id="nickname"
          type="text"
          value={nickname}
          onChange={(e) => handleNicknameChange(e.target.value)}
          placeholder={t('onboarding.nicknamePlaceholder')}
          maxLength={30}
          className={`w-full px-4 py-3 border rounded-lg text-base font-medium focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent transition-all ${
            nicknameError ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        />
        {nicknameError && <p className="text-xs sm:text-sm text-red-600 mt-2">{nicknameError}</p>}
        <p className="text-xs text-gray-500 mt-2">
          {t('onboarding.nicknameHint')}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {nickname.length}/30 {t('onboarding.characters')}
        </p>
      </div>

      {/* Email field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          {t('onboarding.email')} <span className="text-rstu-red">*</span>
        </label>

        <div className="relative">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder={t('onboarding.emailPlaceholder')}
            className={`w-full px-4 py-3 border rounded-lg text-base font-medium focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent transition-all ${
              emailError ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          />

          {/* Validation icons */}
          {email && !emailError && isValidatingEmail && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
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
            </div>
          )}

          {email && !emailError && !isValidatingEmail && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        {emailError && <p className="text-xs sm:text-sm text-red-600 mt-2">{emailError}</p>}

        <p className="text-xs text-gray-500 mt-2">
          {t('onboarding.emailHint')}
        </p>
      </div>

      {/* Password field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          {t('onboarding.password')} <span className="text-rstu-red">*</span>
        </label>

        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            placeholder={t('onboarding.passwordPlaceholder')}
            className={`w-full px-4 py-3 pr-12 border rounded-lg text-base font-medium focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent transition-all ${
              passwordError ? 'border-red-500 bg-red-50' : password && !passwordError ? 'border-green-500' : 'border-gray-300'
            }`}
          />

          {/* Show/hide password toggle */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? t('onboarding.hidePassword') : t('onboarding.showPassword')}
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        {passwordError && <p className="text-xs sm:text-sm text-red-600 mt-2">{passwordError}</p>}

        <p className="text-xs text-gray-500 mt-2">
          {t('onboarding.passwordHint')}
        </p>
      </div>

      {/* Progressive info section */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-xs sm:text-sm text-green-800 leading-relaxed">
          <strong>{t('onboarding.sharedWithOrganizersOnly')}</strong> {t('onboarding.identityPrivacyDesc')}
        </p>
      </div>
    </div>
  );
}
