export const getUploadedDocName = (url: any) => {
  if (!url) return "";
  const imageUrl = url?.split("/");
  console.log(imageUrl[imageUrl?.length - 1]);
  const name: string = imageUrl[imageUrl?.length - 1];
  if (name.length >= 10) {
    return name.slice(0, 4) + "..." + name.slice(-5);
  } else {
    return name;
  }
};

// export const getMultipleUploadedDocNames = (
//   urls: (string | null)[]
// ): string[] => {
//   return urls.map((url) => {
//     if (!url) return "";

//     const imageUrlParts = url.split("/");
//     const name = imageUrlParts.pop() || "";

//     return name.length >= 10 ? `${name.slice(0, 4)}...${name.slice(-5)}` : name;
//   });
// };

export const getMultipleUploadedDocNames = (
  urls: (string | null)[]
): { url: string | null; name: string }[] => {
  return urls.map((url) => {
    if (!url) return { url, name: "" };

    const imageUrlParts = url.split("/");
    const name = imageUrlParts.pop() || "";

    const formattedName =
      name.length >= 10 ? `${name.slice(0, 4)}...${name.slice(-5)}` : name;

    return { url, name: formattedName };
  });
};
