import { LoadingButton } from "@mui/lab";
import { Avatar, Box } from "@mui/material";
import { FC, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import upload from "src/utils/uploadToS3";

interface ProfileChooserProps {
  onSuccess?: any;
  imageUploadUrl?: string;
  disabled?: boolean;
  namespace?: string;
}

export const ProfileChooser: FC<ProfileChooserProps> = ({
  onSuccess,
  imageUploadUrl = "",
  disabled = false,
  namespace = "document",
}) => {
  const { t } = useTranslation();
  const ref = useRef<any>();

  const [isUploading, setIsUploading] = useState(false);

  const openFilePicker = () => {
    ref.current.click();
  };

  const handleUpload = async (files: any[]) => {
    if (files[0]?.size > 999999) {
      toast.error("File size cannot be greater than 1MB");
      return;
    }
    setIsUploading(true);

    try {
      const url = await upload(files, namespace);
      onSuccess(url);
      setIsUploading(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Box
      sx={{
        alignItems: "center",
        display: "flex",
      }}
    >
      <input
        id="selectImage"
        type="file"
        onClick={(e: any) => {
          e.target.value = null;
        }}
        style={{ display: "none" }}
        onChange={(e: any) => handleUpload(e.target.files)}
        ref={ref}
        accept="image/*"
      />

      <Avatar
        src={imageUploadUrl}
        sx={{
          height: 70,
          mr: 1,
          width: 70,
        }}
      />
      <LoadingButton
        loading={isUploading}
        onClick={openFilePicker}
        color="primary"
        disabled={disabled}
      >
        {t("Change")}
      </LoadingButton>
    </Box>
  );
};
