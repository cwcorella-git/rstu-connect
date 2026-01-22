'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { isEmailAvailable } from '@/lib/profileStorage';
import { validatePassword, isSupabaseAuthAvailable } from '@/lib/supabaseAuth';
import { getFieldError } from '../utils';
import type { OnboardingFormData, ValidateEmailResult, ValidatePasswordResult } from '../types';

interface StepIdentityProps {
  formData: OnboardingFormData;
  onFormDataChange: (data: OnboardingFormData) => void;
  onEmailValidation: (result: ValidateEmailResult) => void;
  onPasswordValidation?: (result: ValidatePasswordResult) => void;
  emailValidation?: ValidateEmailResult;
}

export function StepIdentity({
  formData,
  onFormDataChange,
  onEmailValidation,
  onPasswordValidation,
}: StepIdentityProps) {
  const [email, setEmail] = useState(formData.email);
  const [nickname, setNickname] = useState(formData.nickname);
  const [password, setPassword] = useState(formData.password || '');
  const [confirmPassword, setConfirmPassword] = useState(formData.confirmPassword || '');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const emailCheckTimeout = useRef<NodeJS.Timeout | null>(null);
  const autoFocusRef = useRef<HTMLInputElement>(null);

  const requirePassword = isSupabaseAuthAvailable();

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

  // Handle password change
  const handlePasswordChange = useCallback((value: string) => {
    setPassword(value);
    const validation = validatePassword(value);
    setPasswordError(validation.valid ? null : validation.error || null);

    // Update parent form data
    onFormDataChange({
      ...formDataRef.current,
      password: value,
    });

    // Notify parent of validation state
    if (onPasswordValidation) {
      const passwordsMatch = value === confirmPassword;
      onPasswordValidation({
        valid: validation.valid && passwordsMatch,
        error: validation.error || (!passwordsMatch ? 'Passwords do not match' : undefined),
      });
    }
  }, [onFormDataChange, onPasswordValidation, confirmPassword]);

  // Handle confirm password change
  const handleConfirmPasswordChange = useCallback((value: string) => {
    setConfirmPassword(value);

    // Update parent form data
    onFormDataChange({
      ...formDataRef.current,
      confirmPassword: value,
    });

    // Notify parent of validation state
    if (onPasswordValidation) {
      const validation = validatePassword(password);
      const passwordsMatch = password === value;
      onPasswordValidation({
        valid: validation.valid && passwordsMatch,
        error: !passwordsMatch ? 'Passwords do not match' : validation.error,
      });
    }
  }, [onFormDataChange, onPasswordValidation, password]);

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
  }, [email, onEmailValidation]);

  const getPasswordStrength = (): { level: 'weak' | 'medium' | 'strong'; color: string } => {
    if (!password) return { level: 'weak', color: 'bg-gray-200' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { level: 'weak', color: 'bg-red-500' };
    if (strength <= 4) return { level: 'medium', color: 'bg-yellow-500' };
    return { level: 'strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();
  const passwordsMatch = password === confirmPassword;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">About You</h2>
        <p className="text-sm sm:text-base text-gray-600">
          Choose how you&apos;d like to appear to neighbors in your building community.
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
          onChange={(e) => handleNicknameChange(e.target.value)}
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
            onChange={(e) => handleEmailChange(e.target.value)}
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
          We&apos;ll use this to send you organizing updates and help recover your account.
        </p>
      </div>

      {/* Password fields - only show if Supabase Auth is available */}
      {requirePassword && (
        <>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-rstu-red">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Create a secure password"
                className={`w-full px-4 py-3 border rounded-lg text-base font-medium focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent transition-all pr-10 ${
                  passwordError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Password strength indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  <div className={`h-1 flex-1 rounded ${password.length >= 1 ? passwordStrength.color : 'bg-gray-200'}`} />
                  <div className={`h-1 flex-1 rounded ${password.length >= 8 ? passwordStrength.color : 'bg-gray-200'}`} />
                  <div className={`h-1 flex-1 rounded ${passwordStrength.level !== 'weak' ? passwordStrength.color : 'bg-gray-200'}`} />
                  <div className={`h-1 flex-1 rounded ${passwordStrength.level === 'strong' ? passwordStrength.color : 'bg-gray-200'}`} />
                </div>
                <p className={`text-xs ${
                  passwordStrength.level === 'weak' ? 'text-red-600' :
                  passwordStrength.level === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  Password strength: {passwordStrength.level}
                </p>
              </div>
            )}

            {passwordError && <p className="text-xs sm:text-sm text-red-600 mt-1">{passwordError}</p>}
            <p className="text-xs text-gray-500 mt-2">
              At least 8 characters with letters and numbers
            </p>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password <span className="text-rstu-red">*</span>
            </label>
            <input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              placeholder="Confirm your password"
              className={`w-full px-4 py-3 border rounded-lg text-base font-medium focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent transition-all ${
                confirmPassword && !passwordsMatch ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">Passwords do not match</p>
            )}
          </div>
        </>
      )}

      {/* Progressive info section */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-xs sm:text-sm text-green-800 leading-relaxed">
          <strong>Shared with organizers only:</strong> Your email and nickname are visible only to verified
          organizers and neighbors in your building. We never share your information with landlords,
          property managers, or any third parties.
        </p>
      </div>
    </div>
  );
}
