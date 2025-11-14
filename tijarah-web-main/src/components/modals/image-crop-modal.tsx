import { LoadingButton } from "@mui/lab";
import { Card, Grid, Modal, Stack, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { XCircle } from "src/icons/x-circle";
import { canvasPreview } from "src/utils/canvasPreview";
import upload from "src/utils/uploadToS3";
import { useDebounceEffect } from "src/utils/useDebounceEffect";

interface ImageCropModalProps {
  open: boolean;
  handleClose: any;
  handleCroppedImage: (url: string) => void;
  imgSrcUrl: any;
  uploadingImage?: boolean;
  setIsUploadingNew?: any;
  fileUploadNameSpace?: string;
}
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  open,
  handleClose,
  handleCroppedImage,
  imgSrcUrl,
  uploadingImage,
  setIsUploadingNew,
  fileUploadNameSpace = "profile",
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [imgSrc, setImgSrc] = useState("");
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(1 / 1);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setImgSrc(imgSrcUrl);
  }, [imgSrcUrl]);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
      const img = e.currentTarget;
      img.crossOrigin = "anonymous";
      setImgSrc(img.src);
    }
  }

  async function onCropClick() {
    const image = imgRef.current;
    const previewCanvas = previewCanvasRef.current;

    if (!image || !previewCanvas || !completedCrop) {
      throw new Error("Crop canvas does not exist");
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    // Determine output format and quality based on original image
    const originalType = getImageType(image.src) || "image/jpeg";
    const outputType =
      originalType === "image/png" ? "image/png" : "image/jpeg";
    const quality = outputType === "image/jpeg" ? 0.85 : undefined; // 85% quality for JPEG

    const offscreen = new OffscreenCanvas(
      Math.round(cropWidth),
      Math.round(cropHeight)
    );
    const ctx = offscreen.getContext(
      "2d"
    ) as unknown as CanvasRenderingContext2D;

    if (!ctx) {
      throw new Error("No 2d context");
    }

    // Improve rendering quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      Math.round(cropX),
      Math.round(cropY),
      Math.round(cropWidth),
      Math.round(cropHeight),
      0,
      0,
      Math.round(cropWidth),
      Math.round(cropHeight)
    );

    const blob = await new Promise<Blob>((resolve, reject) => {
      const options: any = { type: outputType };
      if (quality !== undefined) {
        options.quality = quality;
      }

      (offscreen as any)
        .convertToBlob(options)
        .then((blob: Blob) => {
          resolve(blob);
        })
        .catch(reject);
    });

    console.log("blob", blob);

    // Preserve original file extension
    const fileExtension = outputType === "image/png" ? ".png" : ".jpg";
    const file = new File([blob], `cropped-image${fileExtension}`, {
      type: outputType,
    });
    console.log("file", file);

    setIsUploading(true);

    try {
      const url = await upload([file], fileUploadNameSpace);
      handleCroppedImage(url);
      setIsUploaded(true);
      setIsUploading(false);
      toast.success("Image Uploaded");
    } catch (error) {
      setIsUploading(false);
      toast.error("Failed to crop");
    }
  }

  // Helper function to detect image type
  function getImageType(src: string): string | null {
    if (src.includes("data:image/")) {
      return src.substring(5, src.indexOf(";"));
    }
    const extension = src.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "webp":
        return "image/webp";
      default:
        return null;
    }
  }
  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          1,
          0
        );
      }
    },
    100,
    [completedCrop]
  );

  return (
    <>
      <Box>
        <Modal
          open={open}
          onClose={() => {
            handleClose();
          }}
        >
          <Card
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: {
                xs: "95vw",
                sm: "60vw",
                md: "60vw",
                lg: "60vw",
              },
              maxHeight: "90%",
              bgcolor: "background.paper",
              overflow: "inherit",
              display: "flex",
              flexDirection: "column",
              p: 4,
            }}
          >
            <Box
              style={{
                flex: "0 0 auto",
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1,
                background: theme.palette.mode !== "dark" ? `#fff` : "#111927",
                padding: "30px",
                paddingBottom: "12px",
                borderRadius: "20px",
              }}
            >
              <Box
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <XCircle
                  fontSize="small"
                  onClick={() => {
                    handleClose();
                  }}
                  style={{ cursor: "pointer" }}
                />
                <Box sx={{ flex: 1, pl: "20px" }}>
                  <Typography variant="h6" style={{ textAlign: "center" }}>
                    {t("Crop Image")}
                  </Typography>
                </Box>
                <LoadingButton
                  onClick={(e) => {
                    if (crop.width != 0) {
                      e.preventDefault();
                      onCropClick();
                      handleClose();
                    } else {
                      toast.error(t("Select an Aspect ratio"));
                    }
                  }}
                  sx={{ mb: 1 }}
                  variant="contained"
                >
                  {t("Crop")}
                </LoadingButton>
              </Box>
            </Box>
            <Box
              style={{
                flex: "1 1 auto",
                overflowY: "scroll",
                padding: 3,
                height: "100%",
                paddingTop: "50px",
              }}
            >
              <Stack spacing={1} sx={{ mt: 2, mb: 1 }}>
                <Grid container>
                  <Grid item md={12} xs={12}>
                    <Box
                      sx={{
                        width: "100%",
                        maxHeight: "70vh",
                        flexDirection: " row",
                        diaplay: "flex !important",
                      }}
                    >
                      {!!imgSrc && (
                        <ReactCrop
                          crop={crop}
                          onChange={(_, percentCrop) => setCrop(percentCrop)}
                          onComplete={(c) => {
                            setCompletedCrop(c);
                          }}
                          aspect={aspect}
                          maxWidth={1000}
                          maxHeight={1000}
                          // circularCrop
                        >
                          <img
                            ref={imgRef}
                            alt="Crop me"
                            src={imgSrc}
                            style={{
                              transform: `scale(${1}) rotate(${0}deg)`,
                            }}
                            onLoad={onImageLoad}
                            crossOrigin="anonymous"
                          />
                        </ReactCrop>
                      )}
                      {!!completedCrop && (
                        <div>
                          <canvas
                            ref={previewCanvasRef}
                            style={{
                              border: "0px solid black",
                              objectFit: "contain",
                              width: 0,
                              height: 0,
                            }}
                          />
                        </div>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
            </Box>
          </Card>
        </Modal>
      </Box>
    </>
  );
};
