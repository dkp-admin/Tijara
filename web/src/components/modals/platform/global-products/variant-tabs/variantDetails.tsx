import {
  Button,
  MenuItem,
  SvgIcon,
  Switch,
  TextField,
  Tooltip,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import endpoint from "src/api/endpoints";
import serviceCaller from "src/api/serviceCaller";
import { ImageCropModal } from "src/components/modals/image-crop-modal";
import { ProductDropzone } from "src/components/product-dropzone";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { unitOptions } from "src/utils/constants";
import { getUploadedDocName } from "src/utils/get-uploaded-file-name";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { FileUploadNamespace } from "src/utils/uploadToS3";
import { useCurrency } from "src/utils/useCurrency";

interface VariantDetailsProps {
  id: any;
  formik: any;
  companyRef: any;
  createNew?: boolean;
  productData?: any;
}

export const VariantDetails: React.FC<VariantDetailsProps> = ({
  formik,
  id,
  companyRef,
  createNew,
  productData,
}) => {
  const { t } = useTranslation();
  const [generateApi, setGenerateApi] = useState(true);
  const [imgSrc, setImgSrc] = useState("");
  const [openCropModal, setOpenCropModal] = useState(false);
  const theme = useTheme();
  const currency = useCurrency();

  const showMargin = (): string => {
    const costPrice = formik.values.costPrice;
    const defaultPrice = formik.values.defaultPrice;

    if (costPrice && defaultPrice) {
      const marginAmount = defaultPrice - costPrice;
      const marginPercentage = ((marginAmount / defaultPrice) * 100).toFixed(2);

      return `${currency} ${marginAmount.toFixed(2)}, ${marginPercentage}%`;
    } else {
      return `0% (${currency} 0)`;
    }
  };

  useEffect(() => {
    showMargin();
  }, [formik.values.costPrice, formik.values.defaultPrice]);

  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const getPriceStrike = () => {
    const originalPrice = formik.values.oldDefaultPrice || 0;
    return (
      <>
        <span style={{ textDecoration: "line-through", marginLeft: "5px" }}>
          {toFixedNumber(originalPrice)}
        </span>
      </>
    );
  };
  const getCostPriceStrike = () => {
    const originalPrice = formik.values.oldCostPrice || 0;
    return (
      <>
        <span style={{ textDecoration: "line-through", marginLeft: "5px" }}>
          {toFixedNumber(originalPrice)}
        </span>
      </>
    );
  };

  const handleUploadLogo = async (files: any) => {
    setIsUploading(true);
    try {
      const file = files[0];
      const tempUrl = URL.createObjectURL(file);
      setImgSrc(tempUrl);
      setIsUploaded(true);
      setIsUploading(false);
    } catch (error) {
      toast.error(error.message);
      setIsUploading(false);
    }
  };
  const variantImageFileDrop = (newFiles: any): void => {
    if (newFiles?.length > 1) {
      toast.error(t("Please select one image to upload"));
      return;
    }

    formik.setFieldValue("variantImageFile", newFiles);
    if (newFiles[0]) {
      setOpenCropModal(true);
    } else {
      toast.error(
        `${t("File type not supported or limit the image size within 1 MB")}`
      );
    }
  };

  const variantImageFileRemove = (): void => {
    formik.setFieldValue("variantImageFile", []);
    formik.setFieldValue("variantImageUrl", "");
  };

  const variantImageRemoveAll = (): void => {
    formik.setFieldValue("variantImageFile", []);
  };

  const handleCroppedImage = (croppedImageUrl: any) => {
    formik.setFieldValue("variantImageUrl", croppedImageUrl);
  };

  const generateUniqueSku = async () => {
    if (generateApi) {
      try {
        const res = await serviceCaller(endpoint.generateUniqueSKU.path, {
          method: endpoint.generateUniqueSKU.method,
        });

        if (res?.sku) {
          setGenerateApi(false);
          formik.setFieldValue("sku", res.sku);
        }
      } catch (error: any) {
        formik.setFieldValue("sku", "");
      }
    }
  };

  useEffect(() => {
    if (formik.values.sku === "" && createNew) {
      setGenerateApi(true);
    }
  }, [formik.values.sku]);

  return (
    <Box sx={{ mt: 2, mb: 6, ml: "auto", mr: "auto", maxWidth: "800px" }}>
      {productData.hasMultipleVariants && (
        <Box
          sx={{
            mt: 2,
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ flex: 0.9, pr: 1 }}>
            <Box>
              <TextFieldWrapper
                inputProps={{ style: { textTransform: "capitalize" } }}
                autoComplete="off"
                fullWidth
                label={t("Variant Name (English)")}
                name="variantNameEn"
                error={Boolean(
                  formik.touched.variantNameEn && formik.errors.variantNameEn
                )}
                helperText={
                  (formik.touched.variantNameEn &&
                    formik.errors.variantNameEn) as any
                }
                onBlur={formik.handleBlur}
                onChange={(e) => {
                  formik.handleChange(e);
                }}
                required
                value={formik.values.variantNameEn}
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <TextFieldWrapper
                inputProps={{ style: { textTransform: "capitalize" } }}
                autoComplete="off"
                fullWidth
                required
                label={t("Variant Name (Arabic)")}
                name="variantNameAr"
                error={Boolean(
                  formik.touched.variantNameAr && formik.errors.variantNameAr
                )}
                helperText={
                  (formik.touched.variantNameAr &&
                    formik.errors.variantNameAr) as any
                }
                onBlur={formik.handleBlur}
                onChange={(e) => {
                  formik.handleChange(e);
                }}
                value={formik.values.variantNameAr}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              flex: 0.2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ProductDropzone
              accept={{
                "image/*": [],
              }}
              files={formik.values.variantImageFile}
              imageName={getUploadedDocName(formik.values.variantImageUrl)}
              uploadedImageUrl={formik.values.variantImageUrl}
              onDrop={variantImageFileDrop}
              onUpload={handleUploadLogo}
              onRemove={variantImageFileRemove}
              onRemoveAll={variantImageRemoveAll}
              isUploaded={isUploaded}
              setIsUploaded={setIsUploaded}
              isUploading={isUploading}
            />
          </Box>
        </Box>
      )}

      <Box sx={{ mt: 3, mx: 0.5 }}>
        <TextFieldWrapper
          inputProps={{ style: { textTransform: "capitalize" } }}
          autoComplete="off"
          fullWidth
          label={t("SKU")}
          name="sku"
          error={Boolean(formik.touched.sku && formik.errors.sku)}
          helperText={(formik.touched.sku && formik.errors.sku) as any}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          disabled={!createNew}
          required
          value={formik.values.sku}
        />
        {createNew && !formik.values.sku && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Button
              onClick={() => {
                generateUniqueSku();
              }}
            >
              {t("Generate SKU")}
            </Button>
          </Box>
        )}
      </Box>
      <Box sx={{ mt: 3, mx: 0.5 }}>
        <TextFieldWrapper
          inputProps={{ style: { textTransform: "capitalize" } }}
          autoComplete="off"
          fullWidth
          error={!!(formik.touched.unit && formik.errors.unit)}
          helperText={(formik.touched.unit && formik.errors.unit) as any}
          label={t("Unit")}
          name="unit"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          select
          value={formik.values.unit}
          required
        >
          {unitOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextFieldWrapper>
      </Box>
      <Box
        sx={{ mt: 3, mx: 0.5 }}
        alignItems="center"
        style={{ display: "flex" }}
      >
        <TextFieldWrapper
          fullWidth
          style={{ width: "100%" }}
          label={t("Cost Price")}
          name="costPrice"
          onBlur={formik.handleBlur}
          onWheel={(event: any) => {
            event.preventDefault();
            event.target.blur();
          }}
          error={(formik?.touched?.costPrice && formik.errors.costPrice) as any}
          helperText={
            (formik.touched.costPrice && formik.errors.costPrice) as any
          }
          onKeyPress={(event): void => {
            const ascii = event.charCode;
            const value = (event.target as HTMLInputElement).value;
            const decimalCheck = value.indexOf(".") !== -1;

            if (decimalCheck) {
              const decimalSplit = value.split(".");
              const decimalLength = decimalSplit[1].length;
              if (decimalLength > 1 || ascii === 46) {
                event.preventDefault();
              } else if (ascii < 48 || ascii > 57) {
                event.preventDefault();
              }
            } else if (value.length > 5 && ascii !== 46) {
              event.preventDefault();
            } else if ((ascii < 48 || ascii > 57) && ascii !== 46) {
              event.preventDefault();
            }
          }}
          InputProps={{
            startAdornment: (
              <Typography
                color="textSecondary"
                variant="body2"
                sx={{ mr: 1, mt: 2.4 }}
              >
                {currency}
              </Typography>
            ),
            endAdornment: formik?.values?.oldCostPrice && (
              <Typography sx={{ mr: 1 }}>{getCostPriceStrike()}</Typography>
            ),
          }}
          onChange={(e) => {
            formik.handleChange(e);
            formik.setFieldValue("pushNotify", true);
            formik.setFieldValue("oldCostPrice", formik?.vlaues?.oldCostPrice);
          }}
          value={formik.values.costPrice}
        />
        <Tooltip
          title={t(
            "The product's cost price is automatically calculated with each stock inward. This reflects the average cost of the product. - For cost price"
          )}
          style={{ marginLeft: "6px", maxWidth: "50px" }}
        >
          <SvgIcon color="action">
            <InfoCircleIcon />
          </SvgIcon>
        </Tooltip>
      </Box>

      <Typography variant="body2" color={"#ff9100"} sx={{ mt: 2 }}>
        {Number(formik.values.costPrice) > 9999.99
          ? `${t("Amount exceeds 4 digits")}`
          : ""}
      </Typography>

      <Box sx={{ mt: 3, mx: 0.5 }}>
        <TextFieldWrapper
          fullWidth
          label={t("Selling Price")}
          name="defaultPrice"
          onBlur={formik.handleBlur}
          onWheel={(event: any) => {
            event.preventDefault();
            event.target.blur();
          }}
          error={
            (formik?.touched?.defaultPrice && formik.errors.defaultPrice) as any
          }
          helperText={
            (formik.touched.defaultPrice && formik.errors.defaultPrice) as any
          }
          onKeyPress={(event): void => {
            const ascii = event.charCode;
            const value = (event.target as HTMLInputElement).value;
            const decimalCheck = value.indexOf(".") !== -1;

            if (decimalCheck) {
              const decimalSplit = value.split(".");
              const decimalLength = decimalSplit[1].length;
              if (decimalLength > 1 || ascii === 46) {
                event.preventDefault();
              } else if (ascii < 48 || ascii > 57) {
                event.preventDefault();
              }
            } else if (value.length > 5 && ascii !== 46) {
              event.preventDefault();
            } else if ((ascii < 48 || ascii > 57) && ascii !== 46) {
              event.preventDefault();
            }
          }}
          InputProps={{
            startAdornment: (
              <Typography
                color="textSecondary"
                variant="body2"
                sx={{ mr: 1, mt: 2.4 }}
              >
                {currency}
              </Typography>
            ),
            endAdornment: formik?.values?.oldDefaultPrice && (
              <Typography sx={{ mr: 1 }}>{getPriceStrike()}</Typography>
            ),
          }}
          onChange={(e) => {
            formik.handleChange(e);
            formik.setFieldValue("pushNotify", true);
            formik.setFieldValue(
              "oldDefaultPrice",
              formik?.vlaues?.oldDefaultPrice
            );
          }}
          value={formik.values.defaultPrice}
        />
      </Box>

      <Typography variant="body2" color={"#ff9100"} sx={{ mt: 2 }}>
        {Number(formik.values.defaultPrice) > 9999.99
          ? `${t("Amount exceeds 4 digits")}`
          : ""}
      </Typography>

      <Box
        sx={{
          mt: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          border: `1px solid ${
            theme.palette.mode !== "dark" ? "#E5E7EB" : "#2D3748"
          }`,
          borderRadius: "8px",
          paddingLeft: "8px",
        }}
      >
        <Typography color="textSecondary">{t("Non Saleable")}</Typography>

        <Box sx={{ p: 1, display: "flex", alignItems: "center" }}>
          <Switch
            color="primary"
            edge="end"
            name="nonSaleable"
            // disabled={id != null}
            checked={formik.values.nonSaleableProduct}
            onChange={(e) => {
              // if (!canUseBatching) {
              //   return toast.error(t("You don't have access"));
              // }
              if (formik.values.nonSaleableProduct) {
                toast(`${t("Product set as saleable")}`);
              } else {
                toast(`${t("Product set as non-saleable")}`);
              }
              formik.handleChange(e);
            }}
            value={formik.values.nonSaleableProduct}
            sx={{
              mr: 0.2,
            }}
          />

          <Tooltip
            title={t(
              "You can change this non-saleable status of this variant when you update this"
            )}
          >
            <SvgIcon color="action">
              <InfoCircleIcon />
            </SvgIcon>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ mt: 3, mx: 0.5 }}>
        <TextField
          fullWidth
          label={t("Margin")}
          disabled
          value={showMargin()}
          onChange={formik.handleChange}
        />
      </Box>

      <ImageCropModal
        open={openCropModal}
        handleClose={() => {
          setOpenCropModal(false);
          setImgSrc(null);
        }}
        handleCroppedImage={handleCroppedImage}
        imgSrcUrl={imgSrc}
        fileUploadNameSpace={FileUploadNamespace["product-images"]}
      />
    </Box>
  );
};
