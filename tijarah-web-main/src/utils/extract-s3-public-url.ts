export function extractPublicURL(url: string) {
  const parsedURL = new URL(url);
  return `${parsedURL.origin}${parsedURL.pathname}`;
}
