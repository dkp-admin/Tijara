import { LoadingButton } from "@mui/lab";
import { Avatar, Box, Button } from "@mui/material";
import { FC, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FileUploadNamespace } from "src/utils/uploadToS3";
import { NewImageCropModal } from "./modals/new-image-crop-modal";

interface LogoUploaderProps {
  onSuccess?: any;
  imageUploadUrl?: string;
  disabled?: boolean;
  origin?: string;
}

export const LogoUploader: FC<LogoUploaderProps> = ({
  onSuccess,
  imageUploadUrl = "",
  disabled = false,
  origin = "print-template",
}) => {
  const { t } = useTranslation();
  const ref = useRef<any>();
  const [openNewCropModal, setOpenNewCropModal] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  const handleNewCroppedImage = async (url: string) => {
    try {
      onSuccess(url);
      setIsUploading(false);
    } catch (error) {
      setIsUploading(false);
      toast.error(error.message);
    }
  };
  const [isUploading, setIsUploading] = useState(false);

  const openFilePicker = () => {
    ref.current.click();
  };

  const handleDrop = async (files: any[]) => {
    if (files[0]?.size > 999999) {
      toast.error("File size cannot be greater than 1MB");
      return;
    }

    const url = URL.createObjectURL(files[0]);

    setIsUploading(true);
    setImgSrc(url);
    setOpenNewCropModal(true);
  };

  const handleRemoveLogo = () => {
    onSuccess("");
  };

  return (
    <>
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
          onChange={(e: any) => handleDrop(e.target.files)}
          ref={ref}
          accept="image/*"
        />

        <Avatar
          src={imageUploadUrl}
          sx={{
            height: 120,
            mr: 1,
            width: 120,
          }}
        />
        <Box sx={{ display: "flex", gap: 1 }}>
          <LoadingButton
            loading={isUploading}
            onClick={openFilePicker}
            color="primary"
            disabled={disabled}
          >
            {t("Change")}
          </LoadingButton>
          {imageUploadUrl && (
            <Button
              onClick={handleRemoveLogo}
              color="error"
              disabled={disabled}
            >
              {t("Remove")}
            </Button>
          )}
        </Box>
      </Box>

      <NewImageCropModal
        setIsUploadingNew={() => {
          setIsUploading(false);
        }}
        origin={origin}
        open={openNewCropModal}
        handleClose={() => {
          setOpenNewCropModal(false);
          setImgSrc(null);
        }}
        handleCroppedImage={handleNewCroppedImage}
        imgSrcUrl={imgSrc}
        fileUploadNameSpace={
          origin === "print-template"
            ? FileUploadNamespace["print-template-logo"]
            : FileUploadNamespace["business-type-logo"]
        }
      />
    </>
  );
};
