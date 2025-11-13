'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cx } from '@/utils/styles';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { useSendOTP, useVerifyOTP } from '@/src/hooks/api/auth';
import { useLocationStore } from '@/src/stores/location-store';
import { OTPModal } from './OTPModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (phoneNumber: string) => void;
}

interface CountryCode {
  code: string;
  country: string;
  length: number;
}

export function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const { language } = useLanguage();
  const { setUserData } = useUser();
  const { locationRef } = useLocationStore();
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('+966');
  const [showCountryDropdown, setShowCountryDropdown] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showOTPModal, setShowOTPModal] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sendOTPMutation = useSendOTP();
  const verifyOTPMutation = useVerifyOTP();

  const countryCodes: CountryCode[] = [
    { code: '+966', country: 'Saudi Arabia', length: 9 },
    { code: '+91', country: 'India', length: 10 },
  ];

  const currentCountryCode = countryCodes.find((c) => c.code === countryCode) || countryCodes[0];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const validatePhoneNumber = useCallback(
    (number: string): boolean => {
      if (number.length !== currentCountryCode.length) {
        setError(
          language === 'ar'
            ? `يجب أن يتكون رقم الهاتف من ${currentCountryCode.length} أرقام`
            : `Phone number must be ${currentCountryCode.length} digits`,
        );
        return false;
      }
      setError('');
      return true;
    },
    [currentCountryCode.length, language],
  );

  useEffect(() => {
    setError('');
    if (phoneNumber.length > 0) {
      validatePhoneNumber(phoneNumber);
    }
  }, [countryCode, phoneNumber, validatePhoneNumber]);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setPhoneNumber(value);
    if (value.length > 0) {
      validatePhoneNumber(value);
    } else {
      setError('');
    }
  };

  const handleOTPRequest = async () => {
    if (phoneNumber.trim() && validatePhoneNumber(phoneNumber)) {
      const fullPhoneNumber = `${countryCode}-${phoneNumber}`;

      sendOTPMutation.mutate(
        { phone: fullPhoneNumber },
        {
          onSuccess: () => {
            setShowOTPModal(true);
            setError('');
          },
          onError: () => {
            setError(
              language === 'ar'
                ? 'حدث خطأ أثناء إرسال رمز OTP. يرجى المحاولة مرة أخرى.'
                : 'Error sending OTP. Please try again.',
            );
          },
        },
      );
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    const fullPhoneNumber = `${countryCode}-${phoneNumber}`;

    verifyOTPMutation.mutate(
      {
        otp,
        phone: fullPhoneNumber,
        locationRef: locationRef || '',
      },
      {
        onSuccess: (data) => {
          if (data?.token && data.userDoc && data.customerDoc) {
            const filteredUserDoc = {
              ...data.userDoc,
            };

            const filteredCustomerDoc = {
              ...data.customerDoc,
            };

            setUserData(filteredUserDoc, filteredCustomerDoc, data.token);
            onLogin(fullPhoneNumber);
            setShowOTPModal(false);
            onClose();
          } else {
            setError(
              data?.message ||
                (language === 'ar' ? 'رمز التحقق غير صحيح' : 'Invalid verification code'),
            );
          }
        },
        onError: (error: unknown) => {
          const errorMessage =
            (error as { response?: { data?: { message?: string } }; message?: string })?.response
              ?.data?.message || (error as { message?: string })?.message;
          setError(
            errorMessage ||
              (language === 'ar'
                ? 'حدث خطأ أثناء التحقق من الرمز. يرجى المحاولة مرة أخرى.'
                : 'Error verifying code. Please try again.'),
          );
        },
      },
    );
  };

  const handleBackFromOTP = () => {
    setShowOTPModal(false);
    setError('');
  };

  const toggleCountryDropdown = () => {
    setShowCountryDropdown((prev) => !prev);
  };

  const selectCountryCode = (code: string) => {
    setCountryCode(code);
    setShowCountryDropdown(false);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
        onClick={handleBackdropClick}
      >
        <div
          ref={modalRef}
          data-modal="login"
          data-close={onClose.toString()}
          className={cx(
            'w-full max-w-lg bg-white dark:bg-[#1a1a1a]',
            'rounded-t-2xl relative overflow-visible animate-slide-up p-6',
            language === 'ar' && 'rtl',
          )}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-300 p-2 rounded-full"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="flex flex-col items-center pt-4 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-5">
              {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </h2>

            <p className="text-gray-600 dark:text-gray-400 text-base mb-8 text-center">
              {language === 'ar'
                ? 'الرجاء مساعدتنا برقم هاتفك للبدء'
                : 'Please help us with your phone number to get started'}
            </p>

            <div className="w-full mb-8">
              <label
                htmlFor="phone"
                className="text-gray-700 dark:text-gray-300 text-base block mb-2"
              >
                {language === 'ar' ? 'رقم الهاتف *' : 'Phone Number *'}
              </label>

              <div
                className={cx(
                  'relative flex items-center border rounded-xl overflow-visible transition-colors',
                  error
                    ? 'border-red-500'
                    : 'border-gray-200 dark:border-gray-700 focus-within:border-orange-500',
                )}
              >
                <div className="relative">
                  <button
                    type="button"
                    onClick={toggleCountryDropdown}
                    className="flex-shrink-0 px-3 py-4 border-r border-gray-200 dark:border-gray-700 flex items-center hover:bg-gray-100 dark:hover:bg-gray-800/30 gap-2"
                  >
                    <span className="text-gray-900 dark:text-white text-base font-medium min-w-[60px]">
                      {countryCode}
                    </span>
                    <svg
                      className={cx(
                        'w-4 h-4 text-gray-400 transition-transform duration-200',
                        showCountryDropdown ? 'rotate-180' : '',
                      )}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {showCountryDropdown && (
                    <div
                      ref={dropdownRef}
                      className="absolute top-full left-0 mt-1 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-[60] w-56"
                    >
                      {countryCodes.map((country) => (
                        <button
                          key={country.code}
                          onClick={() => selectCountryCode(country.code)}
                          className={cx(
                            'w-full text-left px-4 py-3 flex items-center hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors',
                            countryCode === country.code ? 'bg-gray-100 dark:bg-gray-800/70' : '',
                            'gap-3',
                          )}
                        >
                          <span className="text-gray-900 dark:text-white font-medium">
                            {country.code}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 text-sm">
                            {country.country}
                            <span className="text-xs ml-1">({country.length} digits)</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <input
                  ref={inputRef}
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  maxLength={currentCountryCode.length}
                  className="flex-1 bg-transparent px-4 py-4 text-gray-900 dark:text-white outline-none"
                  placeholder={language === 'ar' ? `أدخل رقم هاتفك ` : `Enter your phone number `}
                />

                <div className="pr-4">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-400"
                  >
                    <path
                      d="M22 16.92V19.92C22 20.4704 21.7893 20.9996 21.4142 21.3747C21.0391 21.7498 20.5099 21.9605 19.96 21.9605C19.3872 21.9541 18.8198 21.8701 18.27 21.71C15.1256 20.7531 12.2531 19.0462 9.94 16.71C7.65166 14.4305 5.96825 11.611 4.99 8.51995C4.82916 7.96646 4.74505 7.39557 4.74 6.81995C4.7389 6.27011 4.94825 5.74067 5.32288 5.36418C5.69751 4.98769 6.22594 4.77502 6.775 4.76995H9.775C10.23 4.76487 10.6701 4.942 11.0022 5.2634C11.3344 5.58481 11.5308 6.01798 11.55 6.47995C11.591 7.3155 11.722 8.14246 11.94 8.94995C12.0566 9.36442 12.046 9.8068 11.9097 10.2141C11.7735 10.6214 11.5178 10.9776 11.18 11.24L9.89 12.53C11.0972 14.774 12.9066 16.5812 15.15 17.79L16.44 16.5C16.7024 16.1622 17.0586 15.9065 17.4659 15.7702C17.8732 15.634 18.3156 15.6234 18.73 15.74C19.5375 15.958 20.3644 16.089 21.2 16.13C21.6674 16.1481 22.1058 16.3452 22.427 16.6795C22.7482 17.0137 22.9232 17.4575 22.91 17.92L22 16.92Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <button
              onClick={handleOTPRequest}
              disabled={!phoneNumber.trim() || !!error || sendOTPMutation.isPending}
              className={cx(
                'w-full bg-[#f97315] hover:bg-[#f97315]/90 text-white font-semibold py-4 px-6 rounded-xl transition-colors',
                (!phoneNumber.trim() || !!error || sendOTPMutation.isPending) &&
                  'opacity-70 cursor-not-allowed',
              )}
            >
              {sendOTPMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {language === 'ar' ? 'جارٍ المعالجة...' : 'Processing...'}
                </span>
              ) : language === 'ar' ? (
                'احصل على رمز OTP'
              ) : (
                'Get OTP'
              )}
            </button>
          </div>
        </div>
      </div>

      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onBack={handleBackFromOTP}
        onVerify={handleVerifyOTP}
        phoneNumber={`${countryCode}${phoneNumber}`}
        isLoading={verifyOTPMutation.isPending}
        error={error}
      />
    </>
  );
}
