import serviceCaller from "../api";

export function extractPublicURL(url: string) {
  const parsedURL = new URL(url);
  return `${parsedURL.origin}${parsedURL.pathname}`;
}

export enum FileUploadNamespace {
  "product-images" = "product-images",
  "category-images" = "category-images",
  "user-profile-images" = "user-profile-images",
  "vat-certificates" = "vat-certificates",
  "company-registrations" = "company-registrations",
  "company-logos" = "company-logos",
  "brand-images" = "brand-images",
  "customer-profile-images" = "customer-profile-images",
  "ads-images" = "ads-images",
  "ads-videos" = "ads-videos",
  "customer-pay-credit-images" = "customer-pay-credit-images",
  "payment-gateway" = "payment-gateway-images",
  "collection-images" = "collection-images",
  "accounting-documents" = "accounting-documents",
  "zatca-private-keys" = "zatca-private-keys",
  "custom-charges-icons" = "custom-charges-icons",
  "vendor-profile-images" = "vendor-profile-images",
  "payment-proofs" = "payment-proof-images",
  "misc-expense-images" = "misc-expense-images",
}

const fetchImageFromUri = async (uri: string) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
};

const upload = async (
  uri: string,
  namespace = FileUploadNamespace["product-images"]
) => {
  const name = uri?.split("/").pop() ?? "";
  const extension = name ? name.split(".").pop()?.toLowerCase() ?? "" : "";

  const response = await serviceCaller("/s3/signed-url", {
    query: {
      namespace: namespace,
      fileName: name,
      mimeType: `image/${extension}`,
    },
  });

  const imageBlob = await fetchImageFromUri(uri);

  const uploadResponse = await fetch(response.url, {
    method: "PUT",
    headers: {
      "content-type": `image/${extension}`,
      "x-amz-acl": "public-read",
    },
    body: imageBlob,
  });

  if (uploadResponse.ok) {
    const [downloadUrl] = response.url.split("?");
    return downloadUrl;
  }
  return null;
};

export default upload;
