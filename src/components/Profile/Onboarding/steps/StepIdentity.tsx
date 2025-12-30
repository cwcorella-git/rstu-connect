'use client';

import { useState, useEffect, useRef } from 'react';
import { isEmailAvailable } from '@/lib/profileStorage';
import { validateEmailFormat, getFieldError } from '../utils';
import type { OnboardingFormData, ValidateEmailResult } from '../types';

interface StepIdentityProps {
  formData: OnboardingFormData;
  onFormDataChange: (data: OnboardingFormData) => void;
  onEmailValidation: (result: ValidateEmailResult) => void;
  emailValidation?: ValidateEmailResult;
}

export function StepIdentity({
  formData,
  onFormDataChange,
  onEmailValidation,
  emailValidation,
}: StepIdentityProps) {
  const [email, setEmail] = useState(formData.email);
  const [nickname, setNickname] = useState(formData.nickname);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const emailCheckTimeout = useRef<NodeJS.Timeout | null>(null);
  const autoFocusRef = useRef<HTMLInputElement>(null);

  // Auto-focus nickname input on mount
  useEffect(() => {
    if (autoFocusRef.current && !nickname) {
      autoFocusRef.current.focus();
    }
  }, [nickname]);

  // Validate nickname
  useEffect(() => {
    const error = getFieldError('nickname', nickname, {});
    setNicknameError(error);

    // Update form data
    onFormDataChange({
      ...formData,
      nickname,
    });
  }, [nickname, formData, onFormDataChange]);

  // Debounced email validation
  useEffect(() => {
    // Clear previous timeout
    if (emailCheckTimeout.current) {
      clearTimeout(emailCheckTimeout.current);
    }

    // Clear error when user starts typing
    if (email && emailError && isValidatingEmail === false) {
      setEmailError(null);
      setIsValidatingEmail(false);
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
            ? `Email already registered to ${result.existingNickname}`
            : 'Email already in use';
          setEmailError(errorMsg);
          onEmailValidation({ available: false, error: errorMsg });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not validate email';
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
  }, [email, onEmailValidation, emailError, isValidatingEmail]);

  // Update form data when email changes
  useEffect(() => {
    onFormDataChange({
      ...formData,
      email,
    });
  }, [email, formData, onFormDataChange]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Who are you?</h2>
        <p className="text-sm sm:text-base text-gray-600">
          This is how you'll appear to other members in your building community.
        </p>
      </div>

      {/* Nickname field */}
      <div>
        <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
          Nickname <span className="text-rstu-red">*</span>
        </label>
        <input
          ref={autoFocusRef}
          id="nickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="How should we call you?"
          maxLength={30}
          className={`w-full px-4 py-3 border rounded-lg text-base font-medium focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent transition-all ${
            nicknameError ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        />
        {nicknameError && <p className="text-xs sm:text-sm text-red-600 mt-2">{nicknameError}</p>}
        <p className="text-xs text-gray-500 mt-2">
          No real name required. Be creative! You can always change this later.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {nickname.length}/30 characters
        </p>
      </div>

      {/* Email field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email <span className="text-rstu-red">*</span>
        </label>

        <div className="relative">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
            placeholder="your@email.com"
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
          We'll use this to send you organizing updates and help recover your account.
        </p>
      </div>

      {/* Progressive info section */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
          <strong>Privacy tip:</strong> Your email and nickname are visible only to organizers and members of
          your building. We never share your data with landlords or third parties.
        </p>
      </div>
    </div>
  );
}
