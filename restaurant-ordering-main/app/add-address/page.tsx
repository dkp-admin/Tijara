'use client';

import React, { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { cx } from '@/utils/styles';
import { ADDRESS_TYPES, FORM_DATA_KEY } from '@/utils/addressTypes';
import GoogleMapPicker from './GoogleMapPicker';
import { useGetAddressById, useCreateAddress, useUpdateAddress } from '@/src/hooks/api/address';
import { useAddressForm, COUNTRY_CODES, type CountryCode } from '@/src/hooks/useAddressForm';

export default function AddAddressPage() {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const fromParam = searchParamsHook?.get('from');
  const { language } = useLanguage();

  const params = searchParamsHook;
  const id = params?.get('id') || params?.get('edit'); // Support both 'id' and 'edit' parameters
  const isEditing = Boolean(id);
  const safeId = id || '';

  // React Query hooks
  const { data: addressData } = useGetAddressById(safeId, { enabled: !!id });

  // Use the custom hook for form state and transformations
  const {
    state: { formData, friendsPhone, friendsCountryCode, friendsName },
    actions: {
      setMapLat,
      setMapLng,
      setMapAddress,
      setFriendsCountryCode,
      setFriendsName,
      handleInputChange,
      handlePhoneChange,
      prepareFormDataForAPI,
      buildFullAddress,
      getCurrentCountry,
      isFormValid,
      isFriendsPhoneValid,
    },
  } = useAddressForm(isEditing, addressData);

  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress(safeId, {});

  const addressTypesList = Object.values(ADDRESS_TYPES);

  const handleSaveAndProceed = async () => {
    // Use the hook's preparation function
    const addressFormData = prepareFormDataForAPI();

    try {
      if (isEditing) {
        await updateAddress.mutateAsync(addressFormData);
      } else {
        await createAddress.mutateAsync(addressFormData);
      }

      sessionStorage.removeItem(FORM_DATA_KEY);

      // Use the hook's address building function
      const fullAddress = buildFullAddress();

      const searchParams = new URLSearchParams({
        address: fullAddress,
        addressType: formData.addressType,
        editPersonalDetails: 'true',
      });
      if (fromParam === 'profile') {
        router.push(`/profile?${searchParams.toString()}`);
      } else {
        router.push(`/?${searchParams.toString()}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Company reference')) {
        alert('Missing company information. Please try again or contact support.');
      } else {
        alert('Failed to save address. Please try again.');
      }
    }
  };

  // Get current country and form validation from hook
  const currentCountry = getCurrentCountry();
  const formIsValid = isFormValid();

  const handleBackClick = () => {
    if (fromParam === 'cart') {
      router.back();
    } else {
      router.push('/profile/addresses');
    }
  };

  return (
    <div className={cx('min-h-screen bg-white dark:bg-[#1a1a1a]', language === 'ar' && 'rtl')}>
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800 z-10">
        <div className="p-6">
          <div className={cx('flex items-center gap-4', language === 'ar' && 'flex-row-reverse')}>
            <button
              onClick={handleBackClick}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-2xl transition-colors"
            >
              {language === 'ar' ? '→' : '←'}
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing
                ? language === 'ar'
                  ? 'تعديل العنوان'
                  : 'Edit Address'
                : language === 'ar'
                  ? 'إضافة عنوان'
                  : 'Add Address'}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-32">
        <div className="space-y-4">
          {/* Google Map Picker */}
          <GoogleMapPicker
            onLocationChange={(lat, lng, address) => {
              setMapLat(lat);
              setMapLng(lng);
              setMapAddress(address);
            }}
          />

          {/* House/Flat/Block Details */}
          <div>
            <input
              type="text"
              value={formData.houseDetails}
              onChange={(e) => handleInputChange('houseDetails', e.target.value)}
              placeholder={
                language === 'ar' ? 'المنزل / الشقة / رقم البناية *' : 'House / Flat / Block No. *'
              }
              className={cx(
                'w-full px-4 py-4 bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all',
                language === 'ar' && 'text-right',
              )}
            />
          </div>

          {/* Apartment/Road/Area */}
          <div>
            <input
              type="text"
              value={formData.apartmentDetails}
              onChange={(e) => handleInputChange('apartmentDetails', e.target.value)}
              placeholder={
                language === 'ar' ? 'الشقة / الطريق / المنطقة' : 'Apartment / Road / Area'
              }
              className={cx(
                'w-full px-4 py-4 bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all',
                language === 'ar' && 'text-right',
              )}
            />
          </div>

          {/* Directions */}
          <div>
            <textarea
              value={formData.directions}
              onChange={(e) => handleInputChange('directions', e.target.value)}
              placeholder={language === 'ar' ? 'الاتجاهات للوصول' : 'Directions to reach'}
              rows={4}
              className={cx(
                'w-full px-4 py-4 bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none',
                language === 'ar' && 'text-right',
              )}
            />
          </div>

          {/* Save As Section */}
          <div className="pt-4">
            <h3
              className={cx(
                'text-gray-600 dark:text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider',
                language === 'ar' && 'text-right',
              )}
            >
              {language === 'ar' ? 'حفظ كـ' : 'SAVE AS'}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {addressTypesList.map((type) => (
                <div key={type.id} className="relative">
                  <button
                    onClick={() => handleInputChange('addressType', type.id)}
                    className={cx(
                      'flex items-center gap-1.5 p-2 rounded-lg border transition-all duration-200 w-full',
                      formData.addressType === type.id
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a2a2a] hover:border-gray-300 dark:hover:border-gray-600',
                      language === 'ar' && 'flex-row-reverse',
                    )}
                    style={{ minHeight: 44 }}
                  >
                    <span className="text-base">{type.icon}</span>
                    <span
                      className={cx(
                        'font-medium text-sm text-gray-900 dark:text-white',
                        formData.addressType === type.id && 'text-orange-600 dark:text-orange-400',
                        language === 'ar' && 'text-right',
                      )}
                    >
                      {type.name[language as keyof typeof type.name]}
                    </span>
                  </button>
                  {/* Show phone and name input if Friends and Family is selected */}
                  {formData.addressType === 'friendsFamily' && type.id === 'friendsFamily' && (
                    <div className="col-span-2 mt-2 p-3 bg-white dark:bg-[#181818] rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col gap-3 shadow-sm w-[420px] max-w-full">
                      <PhoneInputCompact
                        value={friendsPhone}
                        onChange={handlePhoneChange}
                        countryCode={friendsCountryCode}
                        setCountryCode={setFriendsCountryCode}
                        currentCountry={currentCountry}
                        isInvalid={friendsPhone.length > 0 && !isFriendsPhoneValid()}
                      />
                      <input
                        type="text"
                        value={friendsName}
                        onChange={(e) => setFriendsName(e.target.value)}
                        className={cx(
                          'w-full px-4 py-3 border rounded-xl text-sm bg-white dark:bg-[#232323] placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all',
                          'border-gray-200 dark:border-gray-700',
                        )}
                        placeholder="Name"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-gray-800 px-4 py-6">
        <button
          onClick={handleSaveAndProceed}
          disabled={!formIsValid}
          className={cx(
            'w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-200',
            formIsValid
              ? 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700 shadow-lg'
              : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed',
          )}
        >
          {language === 'ar' ? 'حفظ والمتابعة' : 'SAVE & PROCEED'}
        </button>
      </div>
    </div>
  );
}

// Compact phone input for Friends and Family (move outside component to avoid re-creation)
function PhoneInputCompact({
  value,
  onChange,
  countryCode,
  setCountryCode,
  currentCountry,
  isInvalid,
}: {
  value: string;
  onChange: (v: string) => void;
  countryCode: string;
  setCountryCode: (c: string) => void;
  currentCountry: CountryCode;
  isInvalid?: boolean;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-2 mt-2 w-full">
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowDropdown((v) => !v)}
          className="px-2 py-1 border rounded text-sm bg-white dark:bg-[#232323] border-gray-300 dark:border-gray-700 min-w-[48px] text-gray-900 dark:text-white flex items-center gap-1"
        >
          {countryCode}
          <svg
            className={cx(
              'w-4 h-4 text-gray-400 transition-transform duration-200',
              showDropdown ? 'rotate-180' : '',
            )}
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 8l4 4 4-4" />
          </svg>
        </button>
        {showDropdown && (
          <div className="absolute z-10 left-0 mt-1 bg-white dark:bg-[#232323] border border-gray-200 dark:border-gray-700 rounded shadow w-32">
            {COUNTRY_CODES.map((c) => (
              <button
                key={c.code}
                onClick={() => {
                  setCountryCode(c.code);
                  setShowDropdown(false);
                  if (inputRef.current) inputRef.current.focus();
                }}
                className={
                  countryCode === c.code
                    ? 'w-full text-left px-3 py-1 text-sm bg-orange-50 dark:bg-orange-900 text-orange-600 dark:text-orange-400'
                    : 'w-full text-left px-3 py-1 text-sm text-gray-900 dark:text-white'
                }
              >
                {c.code}{' '}
                <span className="text-xs text-gray-500 dark:text-gray-400">{c.country}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={currentCountry.length}
        className={cx(
          'flex-1 px-4 py-3 border rounded-xl text-sm bg-white dark:bg-[#232323] placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all w-full',
          isInvalid ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700',
        )}
        placeholder="Phone number"
      />
    </div>
  );
}
