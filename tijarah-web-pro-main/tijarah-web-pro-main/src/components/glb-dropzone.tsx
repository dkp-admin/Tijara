import {
  Avatar,
  Box,
  Button,
  LinearProgress,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import Upload01Icon from "@untitled-ui/icons-react/build/esm/Upload01";
import PropTypes from "prop-types";
import { FC, useEffect } from "react";
import type { DropzoneOptions, FileWithPath } from "react-dropzone";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";

export type File = FileWithPath;

interface glbDropZoneProps extends DropzoneOptions {
  caption?: string;
  files?: File[];
  imageName: string;
  uploadedImageUrl: string;
  onRemove?: (file: File) => void;
  onRemoveAll?: () => void;
  onUpload?: any;
  isUploaded?: any;
  setIsUploaded?: any;
  isUploading?: any;
  fileDataTestId?: string;
  disabled?: boolean;
}

export const GlbFileDropZone: FC<glbDropZoneProps> = (props) => {
  const {
    caption,
    accept,
    files = [],
    imageName,
    uploadedImageUrl,
    maxFiles,
    maxSize,
    minSize,
    onDrop,
    setIsUploaded,
    onRemove,
    onRemoveAll,
    onUpload,
    isUploaded,
    isUploading,
    fileDataTestId,
    disabled,
    ...other
  } = props;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles,
    maxSize,
    minSize,
    onDrop,
    disabled,
  });

  const { t } = useTranslation();

  useEffect(() => {
    if (files.length > 0) {
      onUpload(files);
    }
  }, [files]);

  const hasAnyFiles = files.length > 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        data-testid={fileDataTestId}
        sx={{
          alignItems: "center",
          border: 1,
          borderRadius: 1,
          borderStyle: "dashed",
          borderColor: "divider",
          display: uploadedImageUrl ? "none" : "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          outline: "none",
          p: 1,
          ...(isDragActive && {
            backgroundColor: "action.active",
            opacity: 0.5,
          }),
          "&:hover": {
            backgroundColor: "action.hover",
            cursor: "pointer",
            opacity: 0.5,
          },
        }}
        {...getRootProps()}
      >
        <input {...getInputProps()} />

        {!uploadedImageUrl && (
          <>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <Stack sx={{}} alignItems="center" direction="row" spacing={0}>
                <Avatar
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 64,
                    width: 64,
                  }}
                >
                  <SvgIcon>
                    <Upload01Icon />
                  </SvgIcon>
                </Avatar>
                <Stack spacing={0}>
                  {caption && (
                    <Typography color="text.secondary" variant="body2">
                      {caption}
                    </Typography>
                  )}
                </Stack>
              </Stack>
              <Typography
                sx={{
                  "& span": {
                    textDecoration: "underline",
                  },
                }}
                variant="body2"
              >
                {t("Drag/Click to upload")}
              </Typography>
            </Box>
          </>
        )}
      </Box>

      {!isUploaded && isUploading && (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      )}

      {hasAnyFiles && !isUploading && isUploaded ? (
        <>
          {/* <Typography variant="body2">Product GLB File</Typography> */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "left",
              gap: 1,
              py: 2,
              borderRadius: 1,
              backgroundColor: "background.paper",
              // boxShadow: 1,
            }}
          >
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                size="small"
                onClick={() => window.open(uploadedImageUrl, "_blank")}
                startIcon={
                  <SvgIcon fontSize="small">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </SvgIcon>
                }
              >
                {t("View")}
              </Button>

              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  navigator.clipboard.writeText(uploadedImageUrl);
                }}
                startIcon={
                  <SvgIcon fontSize="small">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
                      />
                    </svg>
                  </SvgIcon>
                }
              >
                {t("Copy Link")}
              </Button>

              <Button
                color="error"
                variant="outlined"
                size="small"
                onClick={() => {
                  if (onRemove) {
                    onRemove(files[0]);
                  }
                  setIsUploaded(false);
                }}
                startIcon={
                  <SvgIcon fontSize="small">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </SvgIcon>
                }
              >
                {t("Remove")}
              </Button>
            </Stack>
          </Box>
        </>
      ) : (
        imageName && (
          <>
            {/* <Typography variant="body2">Product GLB File</Typography> */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "left",
                gap: 1,
                py: 2,
                borderRadius: 1,
                backgroundColor: "background.paper",
                // boxShadow: 1,
              }}
            >
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => window.open(uploadedImageUrl, "_blank")}
                  startIcon={
                    <SvgIcon fontSize="small">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </SvgIcon>
                  }
                >
                  {t("View")}
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(uploadedImageUrl);
                  }}
                  startIcon={
                    <SvgIcon fontSize="small">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
                        />
                      </svg>
                    </SvgIcon>
                  }
                >
                  {t("Copy Link")}
                </Button>

                <Button
                  color="error"
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    if (onRemove) {
                      onRemove(files[0]);
                    }
                    setIsUploaded(false);
                  }}
                  startIcon={
                    <SvgIcon fontSize="small">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </SvgIcon>
                  }
                >
                  {t("Remove")}
                </Button>
              </Stack>
            </Box>
          </>
        )
      )}
    </div>
  );
};

GlbFileDropZone.propTypes = {
  caption: PropTypes.string,
  files: PropTypes.array,
  onRemove: PropTypes.func,
  onRemoveAll: PropTypes.func,
  onUpload: PropTypes.func,
  // From Dropzone
  accept: PropTypes.objectOf(
    PropTypes.arrayOf(PropTypes.string.isRequired).isRequired
  ),
  disabled: PropTypes.bool,
  getFilesFromEvent: PropTypes.func,
  maxFiles: PropTypes.number,
  maxSize: PropTypes.number,
  minSize: PropTypes.number,
  noClick: PropTypes.bool,
  noDrag: PropTypes.bool,
  noDragEventsBubbling: PropTypes.bool,
  noKeyboard: PropTypes.bool,
  onDrop: PropTypes.func,
  onDropAccepted: PropTypes.func,
  onDropRejected: PropTypes.func,
  onFileDialogCancel: PropTypes.func,
  preventDropOnDocument: PropTypes.bool,
};

GlbFileDropZone.defaultProps = {
  files: [],
};
