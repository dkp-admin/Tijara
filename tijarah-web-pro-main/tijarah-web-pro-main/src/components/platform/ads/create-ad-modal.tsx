import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Link,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/system";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ImageCropModal } from "src/components/modals/image-crop-modal";
import { NewImageCropModal } from "src/components/modals/new-image-crop-modal";
import { OgFileDropzone } from "src/components/original-File-dropzone";
import i18n from "src/i18n";
import { getUploadedDocName } from "src/utils/get-uploaded-file-name";
import upload, { FileUploadNamespace } from "src/utils/uploadToS3";
import * as Yup from "yup";

const typeOptions = [
  {
    label: i18n.t("Image"),
    value: "image",
  },
  {
    label: i18n.t("Video"),
    value: "video",
  },
  {
    value: "text-with-image",
    label: i18n.t("Image With Text Promotion"),
  },
];

const durationOptions = [
  { key: 5, value: `5 sec` },
  { key: 10, value: `10 sec` },
  { key: 15, value: `15 sec` },
  { key: 20, value: `20 sec` },
  { key: 25, value: `25 sec` },
  { key: 30, value: `30 sec` },
  { key: 40, value: `40 sec` },
  { key: 50, value: `50 sec` },
  { key: 60, value: `60 sec (1 min)` },
  { key: 70, value: `70 sec` },
  { key: 80, value: `80 sec` },
  { key: 90, value: `90 sec` },
  { key: 120, value: `120 sec (2 min)` },
  { key: 300, value: ` 300 sec (5 min)` },
  { key: 600, value: `600 sec (10 min)` },
];

interface AddSlides {
  type: string;
  imageFile?: any[];
  imageUrl?: string;
  link?: string;
  videoFile?: any[];
  videoUrl?: string;
  textWithImageFile: any[];
  textWithImageUrl: string;
  displayBrandLogo?: boolean;
  textHeadingEn?: string;
  textHeadingAr?: string;
  description?: string;
  iconFile?: any[];
  icon?: string;
  qrFile?: any[];
  qrImage?: string;
  time: string;
  customTime: number;
  mute?: boolean;
}

const initialValues: AddSlides = {
  type: "image",
  imageFile: [],
  imageUrl: "",
  link: "",
  videoFile: [],
  videoUrl: "",
  textWithImageFile: [],
  textWithImageUrl: "",
  displayBrandLogo: false,
  textHeadingEn: "",
  textHeadingAr: "",
  description: "",
  iconFile: [],
  icon: "",
  qrFile: [],
  qrImage: "",
  time: "",
  customTime: null,
  mute: false,
};

const validationSchema = Yup.object({
  type: Yup.string(),
  time: Yup.string().when("type", {
    is: "video",
    then: Yup.string().optional(),
    otherwise: Yup.string().required(i18n.t("Silde Duration is required")),
  }),
  customTime: Yup.number().when("type", {
    is: "video",
    then: Yup.number()
      .required(i18n.t("Silde Duration is required"))
      .min(5, i18n.t("Silde Duration must be greater than or equal to 5 secs"))
      .max(600, i18n.t("You cannot add more than 600 secs"))
      .nullable(),
    otherwise: Yup.number().optional().nullable(),
  }),
  imageUrl: Yup.string().when("type", {
    is: "image",
    then: Yup.string().required(i18n.t("Image is required")),
    otherwise: Yup.string().optional(),
  }),
  // link: Yup.string().when("type", {
  //   is: "video",
  //   then: Yup.string().when("videoUrl", {
  //     is: (val: any) => val === "" || val === undefined || val === null,
  //     then: Yup.string().url().required(i18n.t("Video Link is required")),
  //     otherwise: Yup.string().optional(),
  //   }),
  //   otherwise: Yup.string().optional(),
  // }),
  videoUrl: Yup.string().when("type", {
    is: "video",
    then: Yup.string().when("link", {
      is: (val: any) => val === "" || val === undefined || val === null,
      then: Yup.string().required(i18n.t("Video is required")),
      otherwise: Yup.string().optional(),
    }),
    otherwise: Yup.string().optional(),
  }),
  textHeadingEn: Yup.string().max(
    38,
    i18n.t("Heading English should not be grater than 38 characters.")
  ),
  textHeadingAr: Yup.string().max(
    38,
    i18n.t("Heading Arabic should not be grater than 38 characters.")
  ),
  description: Yup.string().max(
    110,
    i18n.t("Brief should not be grater than 110 characters.")
  ),
});

function convertStoMs(seconds: any) {
  let minutes: any = Math.floor(seconds / 60);
  let extraSeconds: any = seconds % 60;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  extraSeconds = extraSeconds < 10 ? "0" + extraSeconds : extraSeconds;

  return `${seconds} sec = ${minutes} min : ${extraSeconds} sec`;
}

const AddSlidesModal = (props: any) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { open, setOpen, modalData, handleAddSlides } = props;
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [openCropModal, setOpenCropModal] = useState(false);
  const [openNewCropModal, setOpenNewCropModal] = useState(false);
  const [imgSrc, setImgSrc] = useState("");

  const handleCroppedImage = (croppedImageUrl: any) => {
    if (uploadingIcon) {
      formik.setFieldValue("icon", croppedImageUrl);
      setUploadingIcon(false);
      setIsUploaded(true);
      return;
    } else if (uploadingQr) {
      formik.setFieldValue("qrImage", croppedImageUrl);
      setUploadingQr(false);
      setIsUploaded(true);

      return;
    }
  };

  const handleNewCroppedImage = (croppedImageUrl: any) => {
    formik.setFieldValue("imageUrl", croppedImageUrl);
    setIsUploading(false);
    setIsUploaded(true);
  };

  const imageFileDrop = (newFiles: any): void => {
    console.log("image drop", newFiles);

    formik.setFieldValue("imageFile", newFiles);
    if (newFiles[0]) {
      setOpenNewCropModal(true);
    } else {
      toast.error(
        `${t("File type not supported or limit the image size within 1 MB")}`
      );
    }
  };

  const imageFileRemove: any = (): void => {
    formik.setFieldValue("imageFile", []);
    formik.setFieldValue("imageUrl", "");
  };

  const imageFileRemoveAll = (): void => {
    formik.setFieldValue("imageFile", []);
  };

  const handleImageUpload = async (files: any) => {
    console.log("image", files);

    setIsUploading(true);

    try {
      const file = files[0];
      const tempUrl = URL.createObjectURL(file);
      setImgSrc(tempUrl);
      setIsUploaded(true);
      setOpenNewCropModal(true);
    } catch (error) {
      toast.error(error.message);
      setIsUploading(false);
    }
  };

  const videoFileDrop = (newFiles: any): void => {
    const sizes: any[] = newFiles?.map((op: any) => op?.size);

    if (sizes.find((o: any) => o > 10485760)) {
      toast.error("File size cannot be greater than 10MB");
      return;
    }
    formik.setFieldValue("videoFile", newFiles);
  };

  const videoFileRemove = (): void => {
    formik.setFieldValue("videoFile", []);
    formik.setFieldValue("videoUrl", "");
  };

  const videoFileRemoveAll = (): void => {
    formik.setFieldValue("videoFile", []);
  };

  const onVideoSuccess = (fileName: string | undefined) => {
    formik.setFieldValue("videoUrl", fileName);
  };

  const handleVideoUpload = async (files: any) => {
    setIsUploading(true);
    try {
      const url = await upload(files, FileUploadNamespace["ads-videos"]);
      onVideoSuccess(url);
      setIsUploaded(true);
      setIsUploading(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const iconFileDrop = (newFiles: any): void => {
    const sizes: any[] = newFiles?.map((op: any) => op?.size);

    if (sizes.find((o: any) => o > 999999)) {
      toast.error("File size cannot be greater than 1MB");
      return;
    }
    formik.setFieldValue("iconFile", newFiles);
    if (newFiles[0]) {
      setOpenCropModal(true);
    } else {
      toast.error(
        `${t("File type not supported or limit the image size within 10 MB")}`
      );
    }
  };

  const iconFileRemove = (): void => {
    formik.setFieldValue("iconFile", []);
    formik.setFieldValue("icon", "");
  };

  const iconFileRemoveAll = (): void => {
    formik.setFieldValue("iconFile", []);
  };

  const handleIconUpload = async (files: any) => {
    setUploadingIcon(true);
    try {
      const file = files[0];
      const tempUrl = URL.createObjectURL(file);
      setImgSrc(tempUrl);
      setIsUploaded(true);
      setIsUploading(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const qrFileDrop = (newFiles: any): void => {
    const sizes: any[] = newFiles?.map((op: any) => op?.size);

    if (sizes.find((o: any) => o > 999999)) {
      toast.error("File size cannot be greater than 1MB");
      return;
    }
    formik.setFieldValue("qrFile", newFiles);
    if (newFiles[0]) {
      setOpenCropModal(true);
    } else {
      toast.error(
        `${t("File type not supported or limit the image size within 10 MB")}`
      );
    }
  };

  const qrFileRemove = (): void => {
    formik.setFieldValue("qrFile", []);
    formik.setFieldValue("qrImage", "");
  };

  const qrFileRemoveAll = (): void => {
    formik.setFieldValue("qrFile", []);
  };

  const handleQRUpload = async (files: any) => {
    setUploadingQr(true);
    try {
      const file = files[0];
      const tempUrl = URL.createObjectURL(file);
      setImgSrc(tempUrl);
      setIsUploaded(true);
      setIsUploading(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formik: any = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const data: any = {
        contentType: values.type,
        duration: values.type === "video" ? values.customTime : values.time,
      };

      if (values.type === "image" || values.type === "text-with-image") {
        data["imageUrl"] = values.imageUrl;
      }

      if (values.type === "video") {
        data["videoUrl"] = values.videoUrl;
      }

      if (values.type === "video") {
        data["link"] = values.link;
      }

      if (values.type === "text-with-image") {
        data["displayBrandLogo"] = values.displayBrandLogo;
        data["heading"] = {
          en: values.textHeadingEn,
          ar: values.textHeadingAr,
        };
        data["desciption"] = values.description;
        data["icon"] = values.icon;
        data["qrImage"] = values.qrImage;
      }

      handleAddSlides(data);

      setOpen(false);
      formik.resetForm();
      toast.success(t("Slide is Added"));
    },
  });

  console.log("image url", formik.values.imageUrl);

  useEffect(() => {
    if (modalData != null) {
      formik.setValues({
        type: modalData?.contentType || "",
        imageUrl: modalData?.imageUrl || "",
        link: modalData?.link || "",
        videoUrl: modalData?.videoUrl || "",
        displayBrandLogo: modalData?.displayBrandLogo || false,
        textHeadingEn: modalData?.heading?.en,
        textHeadingAr: modalData?.heading?.ar,
        description: modalData?.desciption || "",
        icon: modalData?.icon || "",
        qrImage: modalData?.qrImage || "",
        time: modalData.contentType != "video" ? modalData?.duration : "",
        customTime: modalData.contentType == "video" ? modalData?.duration : "",
        mute: modalData?.mute || false,
      });
    } else {
      formik.resetForm();
    }
  }, [open, modalData]);

  return (
    <>
      <Dialog fullWidth maxWidth="sm" open={open}>
        {/* header */}
        <Box
          sx={{
            display: "flex",
            p: 2,
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor:
              theme.palette.mode === "light" ? "#fff" : "#111927",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          ></Box>

          <Typography sx={{ ml: 2 }} variant="h6">
            {t("Add Slides")}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": {
                backgroundColor: "action.hover",
                cursor: "pointer",
                opacity: 0.5,
              },
            }}
          >
            <CloseIcon
              fontSize="medium"
              onClick={() => {
                setOpen(false);
                formik.resetForm();
              }}
            />
          </Box>
        </Box>
        <Divider />
        {/* body */}

        <DialogContent>
          <form noValidate onSubmit={formik.handleSubmit}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6">{t("Slide Details")}</Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label={t("Content Type")}
                  name="type"
                  select
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  required
                >
                  {typeOptions.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {(formik.values.type === "image" ||
                formik.values.type === "text-with-image") && (
                <Box sx={{ mt: 3 }}>
                  <OgFileDropzone
                    accept={{
                      "image/*": [],
                    }}
                    caption="(SVG, JPG, or PNG)"
                    files={formik.values.imageFile}
                    imageName={getUploadedDocName(formik.values.imageUrl)}
                    maxSize={999999}
                    uploadedImageUrl={formik.values.imageUrl}
                    onDrop={imageFileDrop}
                    onUpload={handleImageUpload}
                    onRemove={imageFileRemove}
                    onRemoveAll={imageFileRemoveAll}
                    maxFiles={1}
                    isUploaded={isUploaded}
                    setIsUploaded={setIsUploaded}
                    isUploading={isUploading}
                  />
                  {Boolean(formik.touched.imageUrl) && (
                    <Typography
                      color="error.main"
                      sx={{
                        mb: 3,
                        fontSize: "12px",
                        fontWeight: 500,
                        margin: "5px 14px 0 14px",
                      }}
                    >
                      {formik.errors.imageUrl}
                    </Typography>
                  )}
                </Box>
              )}

              {formik.values.type === "video" && (
                <Box>
                  <Typography
                    sx={{ mt: 2 }}
                    color="text.secondary"
                    variant="body2"
                  >
                    {t("* Upload the video file in 1920 X 1080 ratio")}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <OgFileDropzone
                      accept={{
                        "video/*": [],
                      }}
                      caption="(MP4, MOV, WMV, AVI, AVCHD, FLV, F4V and SWF, MKV, WEBM or HTML5.)"
                      files={formik.values.videoFile}
                      imageName={getUploadedDocName(formik.values.videoUrl)}
                      uploadedImageUrl={formik.values.videoUrl}
                      onDrop={videoFileDrop}
                      onUpload={handleVideoUpload}
                      onRemove={videoFileRemove}
                      onRemoveAll={videoFileRemoveAll}
                      maxFiles={1}
                      isUploaded={isUploaded}
                      setIsUploaded={setIsUploaded}
                      isUploading={isUploading}
                    />
                    {Boolean(formik.touched.videoUrl) && (
                      <Typography
                        color="error.main"
                        sx={{
                          mb: 3,
                          fontSize: "12px",
                          fontWeight: 500,
                          margin: "5px 14px 0 14px",
                        }}
                      >
                        {formik.errors.videoUrl}
                      </Typography>
                    )}

                    <Typography
                      sx={{ mt: 2 }}
                      color="text.secondary"
                      variant="body2"
                    >
                      {`* ${t("compress your video")}`}
                      <Link
                        target="_"
                        href="https://www.freeconvert.com/video-compressor"
                      >{`${t(" here")}`}</Link>
                    </Typography>
                  </Box>
                </Box>
              )}

              {formik.values.type === "text-with-image" && (
                <Box>
                  <Box sx={{ mt: 3 }}>
                    <TextField
                      autoComplete="off"
                      inputProps={{
                        style: { textTransform: "capitalize" },
                      }}
                      error={Boolean(
                        formik.touched.textHeadingEn &&
                          formik.errors.textHeadingEn
                      )}
                      helperText={
                        (formik.touched.textHeadingEn &&
                          formik.errors.textHeadingEn) as any
                      }
                      fullWidth
                      label={t("Heading (English)")}
                      name="textHeadingEn"
                      onBlur={formik.handleBlur}
                      onChange={(e) => {
                        formik.handleChange(e);
                      }}
                      value={formik.values.textHeadingEn}
                    />
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <TextField
                      autoComplete="off"
                      inputProps={{
                        style: { textTransform: "capitalize" },
                      }}
                      error={Boolean(
                        formik.touched.textHeadingAr &&
                          formik.errors.textHeadingAr
                      )}
                      helperText={
                        (formik.touched.textHeadingAr &&
                          formik.errors.textHeadingAr) as any
                      }
                      fullWidth
                      label={t("Heading (Arabic)")}
                      name="textHeadingAr"
                      onBlur={formik.handleBlur}
                      onChange={(e) => {
                        formik.handleChange(e);
                      }}
                      value={formik.values.textHeadingAr}
                    />
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <TextField
                      autoComplete="off"
                      inputProps={{
                        style: { textTransform: "capitalize" },
                      }}
                      error={Boolean(
                        formik.touched.description && formik.errors.description
                      )}
                      helperText={
                        (formik.touched.description &&
                          formik.errors.description) as any
                      }
                      multiline
                      rows={2}
                      fullWidth
                      label={t("Brief")}
                      name="description"
                      onChange={(e) => {
                        formik.handleChange(e);
                      }}
                      value={formik.values.description}
                    />
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Typography sx={{ mb: 1 }} variant="body2">
                      {t("Upload Icon")}
                    </Typography>
                    <OgFileDropzone
                      accept={{
                        "image/*": [],
                      }}
                      caption="(SVG, JPG, or PNG)"
                      files={formik.values.iconFile}
                      imageName={getUploadedDocName(formik.values.icon)}
                      uploadedImageUrl={formik.values.icon}
                      onDrop={iconFileDrop}
                      onUpload={handleIconUpload}
                      onRemove={iconFileRemove}
                      onRemoveAll={iconFileRemoveAll}
                      maxFiles={1}
                      isUploaded={isUploaded}
                      setIsUploaded={setIsUploaded}
                      isUploading={isUploading}
                    />
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Typography sx={{ mb: 1 }} variant="body2">
                      {t("Upload QR")}
                    </Typography>
                    <OgFileDropzone
                      accept={{
                        "image/*": [],
                      }}
                      caption="(SVG, JPG, or PNG)"
                      files={formik.values.qrFile}
                      imageName={getUploadedDocName(formik.values.qrImage)}
                      uploadedImageUrl={formik.values.qrImage}
                      onDrop={qrFileDrop}
                      onUpload={handleQRUpload}
                      onRemove={qrFileRemove}
                      onRemoveAll={qrFileRemoveAll}
                      maxFiles={1}
                      isUploaded={isUploaded}
                      setIsUploaded={setIsUploaded}
                      isUploading={isUploading}
                    />
                  </Box>
                </Box>
              )}

              {formik.values.type !== "video" ? (
                <Box sx={{ mt: 3 }}>
                  <TextField
                    required
                    autoComplete="off"
                    inputProps={{
                      style: { textTransform: "capitalize" },
                    }}
                    error={Boolean(formik.touched.time && formik.errors.time)}
                    helperText={
                      (formik.touched.time && formik.errors.time) as any
                    }
                    onBlur={formik.handleBlur}
                    fullWidth
                    select
                    label={t("Ad duration (In sec)")}
                    name="time"
                    onChange={(e) => {
                      formik.handleChange(e);
                    }}
                    value={formik.values.time}
                  >
                    {durationOptions.map((duration) => (
                      <MenuItem key={duration.key} value={duration.key}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-start",
                          }}
                        >
                          {duration.value}
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              ) : (
                <Box sx={{ mt: 3 }}>
                  <TextField
                    required
                    autoComplete="off"
                    inputProps={{
                      style: { textTransform: "capitalize" },
                    }}
                    error={Boolean(
                      formik.touched.customTime && formik.errors.customTime
                    )}
                    helperText={
                      (formik.touched.customTime &&
                        formik.errors.customTime) as any
                    }
                    onBlur={formik.handleBlur}
                    fullWidth
                    label={t("Ad duration (In sec)")}
                    name="customTime"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value) {
                        // remove all non numeric characters
                        const cleanedNumber = e.target.value.replace(/\D/g, "");
                        e.target.value = cleanedNumber
                          ? (Number(cleanedNumber) as any)
                          : "";
                      }
                      formik.handleChange(e);
                    }}
                    value={formik.values.customTime}
                  />
                  <Typography sx={{ mt: 2 }}>
                    {formik.values.customTime
                      ? convertStoMs(formik.values.customTime)
                      : ""}
                  </Typography>
                </Box>
              )}
            </Stack>
          </form>
        </DialogContent>

        {/* footer */}
        <Divider />
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "end",
            p: 2,
          }}
        >
          <LoadingButton
            sx={{ borderRadius: 1 }}
            onClick={() => {
              formik.handleSubmit();
            }}
            size="medium"
            variant="contained"
            type="submit"
          >
            {modalData != null ? t("Update") : t("Create")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <ImageCropModal
        open={openCropModal}
        handleClose={() => {
          setOpenCropModal(false);
          setImgSrc(null);
        }}
        handleCroppedImage={handleCroppedImage}
        imgSrcUrl={imgSrc}
        uploadingImage={isUploading}
        fileUploadNameSpace={FileUploadNamespace["ads-images"]}
      />

      <NewImageCropModal
        setIsUploadingNew={() => {
          setIsUploading(false);
          formik.setFieldValue("imageFile", []);
        }}
        open={openNewCropModal}
        handleClose={() => {
          setOpenNewCropModal(false);
          setImgSrc(null);
        }}
        handleCroppedImage={handleNewCroppedImage}
        imgSrcUrl={imgSrc}
        fileUploadNameSpace={FileUploadNamespace["ads-images"]}
      />
    </>
  );
};

export default AddSlidesModal;
