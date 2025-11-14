let geocoder: google.maps.Geocoder;

export default async function geocode(
  request: google.maps.GeocoderRequest
): Promise<any> {
  geocoder = new google.maps.Geocoder();
  try {
    const res = await geocoder.geocode(request);
    const { results } = res;
    return results;
  } catch (error) {
    // toast.error(error.message);
  }
}
