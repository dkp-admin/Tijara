import serviceCaller from "../api";

export function extractPublicURL(url: string) {
  const parsedURL = new URL(url);
  return `${parsedURL.origin}${parsedURL.pathname}`;
}

export enum FileUploadNamespace {
  profile = "profile",
  product = "product",
  variant = "variant",
  category = "category",
  logo = "logo",
}

const fetchImageFromUri = async (uri: string) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
};

const upload = async (uri: string) => {
  let name = uri.substr(uri.lastIndexOf("/") + 1);
  const extension = name.substr(name.lastIndexOf(".") + 1);
  const response = await serviceCaller("/s3/signed-url", {
    query: {
      namespace: "images",
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
