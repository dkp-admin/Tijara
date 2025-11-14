import DeleteOutlineTwoToneIcon from "@mui/icons-material/DeleteOutlineTwoTone";
import {
  Autocomplete,
  Button,
  IconButton,
  MenuItem,
  SvgIcon,
  Switch,
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
import LocationMultiSelect from "src/components/input/location-multiSelect";
import { ProductDropzone } from "src/components/product-dropzone";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { useEntity } from "src/hooks/use-entity";
import { unitOptions, unitOptionsRestaurant } from "src/utils/constants";
import { getUploadedDocName } from "src/utils/get-uploaded-file-name";
import * as Yup from "yup";
import { ImageCropModal } from "../image-crop-modal";
import { FileUploadNamespace } from "src/utils/uploadToS3";
import { useCurrency } from "src/utils/useCurrency";
import { useAuth } from "src/hooks/use-auth";

const customTest = Yup.mixed().test(
  "custom",
  "Price must be a positive number.",
  function (value) {
    if (value <= 0) {
      return false;
    }
    return true;
  }
);

interface VariantDetailsProps {
  id: any;
  formik: any;
  companyRef: any;
  createNew?: boolean;
  productData?: any;
  isSaptco?: boolean;
}

export const VariantDetails: React.FC<VariantDetailsProps> = ({
  isSaptco,
  formik,
  id,
  companyRef,
  createNew,
  productData,
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [generateApi, setGenerateApi] = useState(true);
  const theme = useTheme();
  const [showAddBtn, setShowAddBtn] = useState(false);
  const currency = useCurrency();
  const [imgSrc, setImgSrc] = useState("");
  const [openCropModal, setOpenCropModal] = useState(false);
  const units =
    user?.company?.industry === "restaurant"
      ? unitOptionsRestaurant
      : unitOptions;
  let priceAndLocation = {
    price: 0,
    locationRef: "",
    overriden: true,
    location: {
      name: "",
    },
  };

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
    const margin = showMargin();
  }, [formik.values.costPrice, formik.values.defaultPrice]);

  const { find, entities: locations } = useEntity("location");

  useEffect(() => {
    find({
      page: 0,
      limit: 100,
      _q: "",
      activeTab: "active",
      sort: "asc",
      companyRef: companyRef,
    });
  }, [companyRef]);

  const addLocationPrice = async () => {
    if (formik.values.prices.length !== 0) {
      const PriceSchema = Yup.object({
        price: customTest,
      });
      const index = formik.values.prices.length - 1;

      try {
        await PriceSchema?.validate({
          price: formik.values.prices[index].price,
        });
      } catch (error: any) {
        formik.setErrors({
          prices: "Please enter valid price",
        });
        return;
      }
    }

    formik.setFieldValue("prices", [...formik.values.prices, priceAndLocation]);
  };

  const removeLocationPrice = (index: any) => {
    const filteredLocationPrices = [...formik.values.prices];
    filteredLocationPrices.splice(index, 1);
    formik.setFieldValue("prices", [...filteredLocationPrices]);
  };

  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
    const sizes: any[] = newFiles?.map((op: any) => op?.size);

    if (sizes.find((o: any) => o > 999999)) {
      toast.error("File size cannot be greater than 1MB");
      return;
    }
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

  const getLocationOptions = () => {
    const data = locations?.results?.map((loc) => {
      const locData = formik.values.prices?.filter(
        (price: any) => price?.locationRef == loc?._id
      );

      if (locData?.length > 0) {
        return;
      } else {
        return { label: loc?.name?.en, value: loc?._id };
      }
    });

    return data?.filter((element) => element !== undefined) || [];
  };

  useEffect(() => {
    if (formik.values.sku === "" && createNew) {
      setGenerateApi(true);
    }
  }, [formik.values.sku]);

  useEffect(() => {
    const pricesLength = formik.values.prices.length;

    if (pricesLength == locations.total) {
      setShowAddBtn(true);
    } else if (pricesLength > 0) {
      const data = formik.values.prices;
      const index = data?.length - 1;
      const visible = Boolean(data[index].price && data[index].location.name);

      setShowAddBtn(!visible);
    } else {
      setShowAddBtn(false);
    }
  }, [formik.values.prices]);

  useEffect(() => {
    if (locations.results?.length > 0) {
      const initialStock = locations.results.map((location) => {
        const stock = formik.values.stocks.find(
          (stock: any) => stock.locationRef === location._id
        );

        if (stock?.locationRef) {
          return stock;
        } else {
          return {
            availability: true,
            tracking: false,
            lowStockAlert: false,
            count: 0,
            lowStockCount: 0,
            expiry: null,
            locationRef: location._id,
            location: { name: location.name.en },
          };
        }
      });
      formik.setFieldValue("stocks", initialStock);
    }
  }, [locations.results]);

  return (
    <Box sx={{ mt: 2, mb: 3, ml: "auto", mr: "auto", maxWidth: "800px" }}>
      <Box>
        <LocationMultiSelect
          showAllLocation={formik.values.assignedToAll}
          companyRef={companyRef}
          selectedIds={formik.values.locationRefs}
          required
          id={"locations"}
          error={formik.touched.locationRefs && formik.errors.locationRefs}
          onChange={(option: any, total: number) => {
            formik.setFieldValue("selectedLocations", option);
            if (option?.length > 0) {
              const ids = option.map((option: any) => {
                return option._id;
              });

              const names = option.map((option: any) => {
                return option.name.en;
              });

              if (ids.length == total) {
                formik.setFieldValue("assignedToAll", true);
              } else {
                formik.setFieldValue("assignedToAll", false);
              }

              formik.setFieldValue("locationRefs", ids);
              formik.setFieldValue("locations", names);
            } else {
              formik.setFieldValue("locationRefs", []);
              formik.setFieldValue("locations", []);
              formik.setFieldValue("assignedToAll", false);
            }
          }}
        />
      </Box>

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
              // caption="(SVG, JPG, PNG, PDF, or gif)"
              files={formik.values.variantImageFile}
              imageName={getUploadedDocName(formik.values.variantImageUrl)}
              uploadedImageUrl={formik.values.variantImageUrl}
              onDrop={variantImageFileDrop}
              onUpload={handleUploadLogo}
              onRemove={variantImageFileRemove}
              onRemoveAll={variantImageRemoveAll}
              // maxFiles={1}
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
          required={isSaptco}
          fullWidth
          label={isSaptco ? t("Kilometers") : t("Product Code")}
          name="code"
          error={Boolean(formik.touched.code && formik.errors.code)}
          helperText={(formik.touched.code && formik.errors.code) as any}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.code}
        />
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
          {units.map((option) => (
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
          }}
          onChange={(e) => {
            formik.handleChange(e);
            formik.setFieldValue("oldCostPrice", formik.vlaues?.oldCostPrice);
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
          required={isSaptco}
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
          }}
          onChange={(e) => {
            formik.handleChange(e);
            formik.setFieldValue(
              "oldDefaultPrice",
              formik.vlaues?.oldDefaultPrice
            );
          }}
          value={formik.values.defaultPrice}
        />

        <Typography variant="body2" color={"#ff9100"} sx={{ mt: 2 }}>
          {Number(formik.values.defaultPrice) > 9999.99
            ? `${t("Amount exceeds 4 digits")}`
            : ""}
        </Typography>

        {formik.values.prices?.length > 0 &&
          formik.values.prices.map((data: any, index: any) => (
            <Box
              key={index}
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <TextFieldWrapper
                inputProps={{ style: { textTransform: "capitalize" } }}
                autoComplete="off"
                fullWidth
                required
                label="Price"
                name={`prices.${index}.price`}
                onWheel={(event: any) => {
                  event.preventDefault();
                  event.target.blur();
                }}
                error={
                  (formik?.touched?.prices &&
                    index === formik.values.prices.length - 1 &&
                    formik.errors.prices) as any
                }
                helperText={
                  (index === formik.values.prices.length - 1 &&
                    formik.touched.prices &&
                    formik.errors.prices) as any
                }
                onBlur={formik.handleBlur}
                onChange={(e) => {
                  formik.handleChange(e);
                }}
                value={formik.values.prices[index].price}
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
                }}
                sx={{ mr: 2, width: "42%" }}
              />

              <Box sx={{ width: "50%" }}>
                <Autocomplete
                  options={getLocationOptions()}
                  renderInput={(params) => (
                    <TextFieldWrapper
                      inputProps={{
                        style: { textTransform: "capitalize" },
                      }}
                      required
                      autoComplete="off"
                      {...params}
                      label="Location"
                      name={`prices.${index}.locationRef`}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.prices[index].locationRef}
                    />
                  )}
                  value={formik.values.prices[index].location.name}
                  onChange={(e, option) => {
                    formik.setFieldValue(
                      `prices.${index}.locationRef`,
                      option?.value
                    );

                    formik.setFieldValue(
                      `prices.${index}.location.name`,
                      option?.label
                    );
                  }}
                />
              </Box>

              <IconButton
                color="error"
                onClick={() => {
                  removeLocationPrice(index);
                }}
              >
                <DeleteOutlineTwoToneIcon />
              </IconButton>
            </Box>
          ))}

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: 1,
          }}
        >
          <Button disabled={showAddBtn} onClick={addLocationPrice}>
            {t("Add Price Override")}
          </Button>
        </Box>
      </Box>

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
            checked={formik.values.nonSaleable}
            onChange={(e) => {
              // if (!canUseBatching) {
              //   return toast.error(t("You don't have access"));
              // }
              if (formik.values.nonSaleable) {
                toast(`${t("Set as saleable")}`);
              } else {
                toast(`${t("Set as non-saleable")}`);
              }
              formik.handleChange(e);
            }}
            value={formik.values.nonSaleable}
            sx={{
              mr: 0.2,
            }}
          />

          <Tooltip
            title={t(
              "You can change this non-saleable status of this box when you update this"
            )}
          >
            <SvgIcon color="action">
              <InfoCircleIcon />
            </SvgIcon>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ mt: 3, mx: 0.5 }}>
        <TextFieldWrapper
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
