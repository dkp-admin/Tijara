import {
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
import XIcon from "@untitled-ui/icons-react/build/esm/X";
import PropTypes from "prop-types";
import { FC, useEffect } from "react";
import type { DropzoneOptions, FileWithPath } from "react-dropzone";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { bytesToSize } from "src/utils/bytes-to-size";
import { FileIcon } from "./file-icon";

export type File = FileWithPath;

interface ExportFileDropzoneProps extends DropzoneOptions {
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

export const ExportFileDropzone: FC<ExportFileDropzoneProps> = (props) => {
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
          display: "flex",
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
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <Stack alignItems="center" direction="row" spacing={2}>
          <Stack spacing={1}>
            <Typography
              sx={{
                "& span": {
                  textDecoration: "underline",
                },
              }}
              variant="h6"
            >
              <span>{t("Click to upload")}</span> {" or drag and drop"}
            </Typography>
            {caption && (
              <Typography color="text.secondary" variant="body2">
                {caption}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Box>
      {!isUploaded && isUploading && (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      )}
      {hasAnyFiles ? (
        <Box sx={{ mt: 2 }}>
          <List>
            {files.map((file) => {
              const extension = file.name.split(".").pop();

              return (
                <ListItem
                  key={file.path}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    "& + &": {
                      mt: 1,
                    },
                  }}
                >
                  <ListItemIcon>
                    <FileIcon extension={extension} />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    primaryTypographyProps={{
                      color: "textPrimary",
                      variant: "subtitle2",
                    }}
                    secondary={bytesToSize(file.size)}
                  />
                  <Tooltip title={t("Remove")}>
                    <IconButton
                      edge="end"
                      onClick={() => {
                        if (onRemove) {
                          onRemove(file);
                        }
                        setIsUploaded(false);
                      }}
                    >
                      <SvgIcon>
                        <XIcon />
                      </SvgIcon>
                    </IconButton>
                  </Tooltip>
                </ListItem>
              );
            })}
          </List>
          {maxFiles != 1 && (
            <Stack
              alignItems="center"
              direction="row"
              justifyContent="flex-end"
              spacing={2}
              sx={{ mt: 2 }}
            >
              <Button
                color="inherit"
                onClick={onRemoveAll}
                size="small"
                type="button"
              >
                Remove All
              </Button>
              <Button
                onClick={onUpload}
                size="small"
                type="button"
                variant="contained"
              >
                Upload
              </Button>
            </Stack>
          )}
        </Box>
      ) : (
        imageName && (
          <Box sx={{ mt: 2 }}>
            <List>
              <ListItem
                key={imageName}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  "& + &": {
                    mt: 1,
                  },
                }}
              >
                <ListItemIcon>
                  <FileIcon extension={imageName.split(".").pop()} />
                </ListItemIcon>
                <ListItemText
                  primary={imageName}
                  primaryTypographyProps={{
                    color: "textPrimary",
                    variant: "subtitle2",
                  }}
                />
                <Button
                  color="primary"
                  href={uploadedImageUrl}
                  target="_blank"
                  component={Link}
                  sx={{ ml: 2 }}
                >
                  {t("View")}
                </Button>
              </ListItem>
            </List>
          </Box>
        )
      )}
    </div>
  );
};

ExportFileDropzone.propTypes = {
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

ExportFileDropzone.defaultProps = {
  files: [],
};
