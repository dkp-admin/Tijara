import { useRef, useEffect, useState } from 'react';
import { cx } from '@/utils/styles';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatTime } from '@/src/utils/formatting';

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void; // Add onBack prop
  onVerify: (otp: string) => void;
  phoneNumber: string;
  isLoading?: boolean;
  error?: string;
}

export function OTPModal({
  isOpen,
  onClose,
  onBack,
  onVerify,
  phoneNumber,
  isLoading,
  error,
}: OTPModalProps) {
  const { language } = useLanguage();
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const [timer, setTimer] = useState(41);

  // Focus first input on open
  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the backdrop itself, not the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle input change
  const handleInputChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto focus next input
      if (value !== '' && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }

      // Submit if all digits are entered
      if (newOtp.every((digit) => digit !== '')) {
        onVerify(newOtp.join(''));
      }
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && index > 0 && !otp[index]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-end justify-center"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={cx(
          'w-full max-w-lg bg-white dark:bg-[#1a1a1a]',
          'rounded-t-2xl relative overflow-visible animate-slide-up p-6',
          language === 'ar' && 'rtl',
        )}
      >
        {/* Back button */}
        <button
          onClick={onBack}
          className={cx(
            'absolute top-4 text-gray-400 hover:text-gray-300 p-2 rounded-full flex items-center gap-2',
            language === 'ar' ? 'right-4' : 'left-4',
          )}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d={language === 'ar' ? 'M12 5L7 10L12 15' : 'M12 5L7 10L12 15'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm">{language === 'ar' ? 'رجوع' : 'Back'}</span>
        </button>

        {/* Close button */}
        <button
          onClick={onClose}
          className={cx(
            'absolute top-4 text-gray-400 hover:text-gray-300 p-2 rounded-full',
            language === 'ar' ? 'left-4' : 'right-4',
          )}
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
          <h2 className="text-2xl font-bold text-white mb-5">
            {language === 'ar' ? 'أدخل رمز التحقق' : 'Enter the OTP'}
          </h2>

          <p className="text-gray-400 text-base mb-8 text-center">
            {language === 'ar'
              ? `تم إرسال رمز التحقق إلى ${phoneNumber}`
              : `Verification code has been sent to ${phoneNumber}`}
          </p>

          <div
            className={cx(
              'flex items-center justify-between gap-2 mb-8',
              language === 'ar' && 'flex-row-reverse',
            )}
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="tel"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={cx(
                  'w-14 h-14 text-center text-xl font-bold rounded-xl outline-none transition-colors',
                  'bg-gray-100 dark:bg-gray-800/30 border border-transparent',
                  error ? 'border-red-500' : 'focus:border-orange-500',
                  'text-gray-900 dark:text-white',
                )}
                maxLength={1}
              />
            ))}
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex flex-col items-center gap-2">
            <p className="text-gray-400 text-sm">
              {language === 'ar' ? 'لم تستلم الرمز؟' : "Didn't receive the code?"}
            </p>
            <p className="text-gray-400 text-sm">({formatTime(timer)})</p>
          </div>

          <button
            onClick={() => onVerify(otp.join(''))}
            disabled={otp.some((d) => !d) || isLoading}
            className={cx(
              'w-full bg-[#f97315] hover:bg-[#f97315]/90 text-white font-semibold py-4 px-6 rounded-xl mt-8 transition-colors',
              (otp.some((d) => !d) || isLoading) && 'opacity-70 cursor-not-allowed',
            )}
          >
            {isLoading ? (
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
                {language === 'ar' ? 'جارٍ التحقق...' : 'Verifying...'}
              </span>
            ) : language === 'ar' ? (
              'تحقق'
            ) : (
              'Verify'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
