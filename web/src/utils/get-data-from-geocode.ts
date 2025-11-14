const getDataFromGeoCoderResult = (geoCoderResponse: any) => {
  const geoCoderResponseHead = geoCoderResponse[0];
  const geoCoderData = geoCoderResponseHead.address_components;
  const isEmptyData = !geoCoderResponseHead || !geoCoderData;

  if (isEmptyData) return {};

  return geoCoderData.reduce((acc: any, { types, long_name: value }: any) => {
    const type = types[0];

    switch (type) {
      case "route":
        return { ...acc, route: value };
      case "locality":
        return { ...acc, locality: value };
      case "country":
        return { ...acc, country: value };
      case "postal_code_prefix":
        return { ...acc, postalCodePrefix: value };
      case "street_number":
        return { ...acc, streetNumber: value };
      default:
        return acc;
    }
  }, {});
};

export default getDataFromGeoCoderResult;
