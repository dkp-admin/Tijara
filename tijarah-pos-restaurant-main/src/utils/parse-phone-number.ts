export default function parsePhoneNumber(
  countryCode: string,
  phoneNumber: string
) {
  return countryCode + "-" + phoneNumber;
}
