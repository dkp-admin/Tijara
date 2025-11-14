import serviceCaller from "../api";

export function extractPublicURL(url: string) {
  const parsedURL = new URL(url);
  return `${parsedURL.origin}${parsedURL.pathname}`;
}

export enum FileUploadNamespace {
  document = "document",
  profile = "profile",
  location = "location",
  "truck-type" = "truck-type",
  "booking" = "booking",
  "trip" = "trip",
}

export const fetchImageFromUri = async (uri: string) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
};

export default async function upload(name: any, imageBlob: any) {
  const extension = name.substr(name.lastIndexOf(".") + 1);
  const response = await serviceCaller("/s3/signed-url", {
    query: {
      namespace: "documents",
      fileName: name,
      mimeType: `image/${extension}`,
    },
  });

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
  throw new Error("Upload failed");
}
