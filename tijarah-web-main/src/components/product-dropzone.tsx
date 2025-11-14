import {
  Avatar,
  Box,
  Button,
  LinearProgress,
  List,
  ListItem,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import Upload01Icon from "@untitled-ui/icons-react/build/esm/Upload01";
import Image from "next/image";
import PropTypes from "prop-types";
import { FC, useEffect } from "react";
import type { DropzoneOptions, FileWithPath } from "react-dropzone";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";

export type File = FileWithPath;

interface productDropzoneProps extends DropzoneOptions {
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

export const ProductDropzone: FC<productDropzoneProps> = (props) => {
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
        )}
      </Box>

      {!isUploaded && isUploading && (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      )}

      {hasAnyFiles ? (
        <Box sx={{ mt: -2, mb: -3 }}>
          <List>
            {files.map((file) => {
              return (
                <ListItem key={file.path}>
                  {uploadedImageUrl && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Image
                        style={{
                          marginTop: 2,
                          borderRadius: 50,
                          objectFit: "cover",
                        }}
                        src={uploadedImageUrl}
                        alt=""
                        width={80}
                        height={80}
                      />

                      <Button
                        color="error"
                        variant="text"
                        onClick={() => {
                          if (onRemove) {
                            onRemove(file);
                          }
                          setIsUploaded(false);
                        }}
                      >
                        {t("Remove")}
                      </Button>
                    </Box>
                  )}
                </ListItem>
              );
            })}
          </List>
        </Box>
      ) : (
        imageName && (
          <Box sx={{ mt: -2, mb: -3 }}>
            <List>
              <ListItem key={imageName}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      alignItems: "center",
                      backgroundColor: "neutral.50",
                      backgroundImage: `url(${uploadedImageUrl})`,
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                      borderRadius: 40,
                      display: "flex",
                      height: 80,
                      justifyContent: "center",
                      overflow: "hidden",
                      width: 80,
                    }}
                  />

                  <Button
                    color="error"
                    variant="text"
                    onClick={() => {
                      if (onRemove) {
                        onRemove(files[0]);
                      }
                      setIsUploaded(false);
                    }}
                  >
                    {t("Remove")}
                  </Button>
                </Box>
              </ListItem>
            </List>
          </Box>
        )
      )}
    </div>
  );
};

ProductDropzone.propTypes = {
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

ProductDropzone.defaultProps = {
  files: [],
};
