import * as FileSystem from "expo-file-system";
import { useEffect, useState } from "react";

const useImageLocalPath = () => {
  const [localImagePath, setLocalImagePath] = useState("") as any;
  const [url, setUrl] = useState("") as any;

  useEffect(() => {
    const downloadImage = async () => {
      const localFileName = url?.split("/").pop(); // Extract the file name from the URL
      const localDirectory = FileSystem.documentDirectory;
      const localImagePath = `${localDirectory}${localFileName}`;

      const { uri }: { uri: string } = await FileSystem.downloadAsync(
        url,
        localImagePath
      );
      setLocalImagePath(uri);
    };

    downloadImage();
  }, [url]);

  function getImagePath(imageUrl: string) {
    setUrl(imageUrl);
  }

  return { path: localImagePath, getImagePath };
};

export default useImageLocalPath;
