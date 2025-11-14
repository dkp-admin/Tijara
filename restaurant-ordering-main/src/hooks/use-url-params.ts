import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export const useUrlParams = () => {
  const params = useSearchParams();

  useEffect(() => {
    const urlLocationRef = params.get('locationRef');
    const urlCompanyRef = params.get('companyRef');

    if (urlLocationRef && urlCompanyRef) {
      console.log('URL params found but letting menu API handle reference setting:', {
        urlLocationRef,
        urlCompanyRef,
      });
    }
  }, [params]);
};
