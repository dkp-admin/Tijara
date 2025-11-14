import endpoint from "src/api/endpoints";
import serviceCaller from "src/api/serviceCaller";
import { extractPublicURL } from "./extract-s3-public-url";

export enum FileUploadNamespace {
  "product-images" = "product-images",
  "category-images" = "category-images",
  "user-profile-images" = "user-profile-images",
  "vat-certificates" = "vat-certificates",
  "company-registrations" = "company-registrations",
  "commercial-registrations-certificate" = "commercial-registrations-certificate",
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
  "apk-management-files" = "apk-management-files",
  "hardwares" = "hardwares",
  "print-template-logo" = "print-template-logo",
  "glb-file" = "glb-file",
  "business-type-logo" = "business-type-logo",
}

export default async function upload(files: any[], namespace: any) {
  if (!files) {
    return;
  }

  const file = files[0];
  const arrayBuffer = await file.arrayBuffer();
  const blob = new Blob([arrayBuffer], {
    type: file.type,
  });
  const signedURL = await serviceCaller(endpoint.getSignedUrl.path, {
    method: endpoint.getSignedUrl.method,
    query: {
      fileName: file.name.slice(-50),
      fileType: file.type,
      namespace: namespace,
    },
  });

  const response = await fetch(signedURL.url, {
    method: "PUT",
    body: blob,
    headers: {
      "Content-Type": file.type,
      "x-amz-acl": "public-read",
    },
  });
  if (response.ok) {
    return extractPublicURL(signedURL.url);
  }
  throw new Error("Upload failed");
}
