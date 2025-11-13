import { Avatar, Box, Link, Stack, SvgIcon, Typography } from "@mui/material";
import Upload01Icon from "@untitled-ui/icons-react/build/esm/Upload01";
import PropTypes from "prop-types";
import { FC, useEffect } from "react";
import type { DropzoneOptions, FileWithPath } from "react-dropzone";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";

export type File = FileWithPath;

interface NewFileDropzoneProps extends DropzoneOptions {
  ImageURL?: string;
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

export const NewFileDropzone: FC<NewFileDropzoneProps> = (props) => {
  const {
    ImageURL,
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

  return (
    <div>
      <Box sx={{ mr: ImageURL ? 2 : -2, ml: 2 }} data-testid={fileDataTestId}>
        <input {...getInputProps()} />
        <Stack alignItems="center" direction="row" spacing={2}>
          <Box {...getRootProps()}>
            <Avatar
              sx={{
                "&:hover": {
                  backgroundColor: "action.hover",
                  cursor: "pointer",
                  opacity: 0.5,
                },
                // ml: 2,
                height: 34,
                width: 34,
              }}>
              <SvgIcon>
                <Upload01Icon />
              </SvgIcon>
            </Avatar>
          </Box>
          <Box
            sx={{
              // width: "60px",
              borderRadius: 1,
              // display: "flex",
              justifyContent: "center",
              "&:hover": {
                backgroundColor: "action.hover",
                cursor: "pointer",
                opacity: 0.5,
              },
            }}>
            <Link
              sx={{ display: ImageURL ? "flex" : "none" }}
              target="_blank"
              href={ImageURL}>
              {t("View")}
            </Link>
          </Box>
        </Stack>
      </Box>
    </div>
  );
};

NewFileDropzone.propTypes = {
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

NewFileDropzone.defaultProps = {
  files: [],
};
