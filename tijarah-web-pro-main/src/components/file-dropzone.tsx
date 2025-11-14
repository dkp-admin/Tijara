import { FC, useEffect } from "react";
import PropTypes from "prop-types";
import type { DropzoneOptions, FileWithPath } from "react-dropzone";
import { useDropzone } from "react-dropzone";
import Upload01Icon from "@untitled-ui/icons-react/build/esm/Upload01";
import XIcon from "@untitled-ui/icons-react/build/esm/X";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  LinearProgress,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
} from "@mui/material";
import { bytesToSize } from "src/utils/bytes-to-size";
import { FileIcon } from "./file-icon";
import { useTranslation } from "react-i18next";
import Image from "next/image";

export type File = FileWithPath;

interface FileDropzoneProps extends DropzoneOptions {
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

export const FileDropzone: FC<FileDropzoneProps> = (props) => {
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
    <div>
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
          p: 6,
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
        {...getRootProps()}>
        <input {...getInputProps()} />

        {!uploadedImageUrl && (
          <Stack alignItems="center" direction="row" spacing={2}>
            <Avatar
              sx={{
                height: 64,
                width: 64,
              }}>
              <SvgIcon>
                <Upload01Icon />
              </SvgIcon>
            </Avatar>
            <Stack spacing={1}>
              <Typography
                sx={{
                  "& span": {
                    textDecoration: "underline",
                  },
                }}
                variant="h6">
                <span>{t("Click to upload")}</span> {" or drag and drop"}
              </Typography>
              {caption && (
                <Typography color="text.secondary" variant="body2">
                  {caption}
                </Typography>
              )}
            </Stack>
          </Stack>
        )}
      </Box>

      {!isUploaded && isUploading && (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      )}

      {hasAnyFiles && (
        <Box sx={{ mt: -2, mb: -3 }}>
          <List>
            {files.map((file) => {
              const extension = file.name.split(".").pop();

              return (
                <ListItem key={file.path}>
                  {uploadedImageUrl && (
                    <Box>
                      <Image
                        style={{
                          borderRadius: 50,
                          marginRight: 10,
                          objectFit: "cover",
                        }}
                        src={uploadedImageUrl}
                        alt=""
                        width={70}
                        height={70}
                      />
                    </Box>
                  )}

                  {uploadedImageUrl && (
                    <Tooltip title={t("Remove")}>
                      <IconButton
                        edge="end"
                        onClick={() => {
                          if (onRemove) {
                            onRemove(file);
                          }
                          setIsUploaded(false);
                        }}>
                        <SvgIcon>
                          <XIcon />
                        </SvgIcon>
                      </IconButton>
                    </Tooltip>
                  )}
                </ListItem>
              );
            })}
          </List>
        </Box>
      )}
    </div>
  );
};

FileDropzone.propTypes = {
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

FileDropzone.defaultProps = {
  files: [],
};
