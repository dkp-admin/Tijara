import { useNavigation } from "@react-navigation/core";
import { format } from "date-fns";
import React, { useContext, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import * as TSCPrintLabel from "tsc-print-label-v1";
import { t } from "../../../i18n";
import ActionSheetHeader from "../../components/action-sheet/action-sheet-header";
import TrashIcon from "../../components/assets/trash-icon";
import ProductSelectInput from "../../components/barcode-print/product-select-input";
import PrintTemplateViewModal from "../../components/billing/left-view/modal/print-template-view-modal";
import { PrimaryButton } from "../../components/buttons/primary-button";
import CustomHeader from "../../components/common/custom-header";
import DateInput from "../../components/input/date-input";
import Input from "../../components/input/input";
import SelectInput from "../../components/input/select-input";
import PrintListHeader from "../../components/print/print-list-header";
import Spacer from "../../components/spacer";
import DefaultText from "../../components/text/Text";
import ErrorText from "../../components/text/error-text";
import showToast from "../../components/toast";
import WideBarcode from "../../components/wide-barcode";
import DeviceContext from "../../context/device-context";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { checkKeyboardState } from "../../hooks/use-keyboard-state";
import { useResponsive } from "../../hooks/use-responsiveness";
import { BARCODE_PAPER_SIZES } from "../../utils/constants";
import { repo } from "../../utils/createDatabaseConnection";
import ICONS from "../../utils/icons";
import { showAlert } from "../../utils/showAlert";

interface BarcodeData {
  locationName: string;
  price: number;
  productNameEn: string;
  // productNameAr: string;
  sku: string;
  expiry: Date;
  labelPrint: string;
}

const BarcodePrinting = () => {
  const theme = useTheme();
  const isRTL = checkDirection();
  const navigation = useNavigation() as any;
  const productSelectInputRef = useRef<any>();
  const isKeyboardVisible = checkKeyboardState();
  const { twoPaneView, hp, wp } = useResponsive();
  const deviceContext = useContext(DeviceContext) as any;

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [errorIndex, setErrorIndex] = useState<number>(-1);

  const [barcodeData, setBarcodeData] = useState({
    all: true,
    locationName: true,
    productNameEn: true,
    // productNameAr: true,
    price: true,
    barcode: true,
    expiry: true,
    paperSize: "50 mm,25 mm",
    products: [] as any,
  });

  const getOptionLabel = (option: any) => {
    if (isRTL) {
      if (option?.variant?.type === "box") {
        return `${option?.name?.ar || ""} ${
          option?.hasMultipleVariants ? option?.variant?.name?.ar : ""
        } [${t("Box")} - ${option?.variant?.noOfUnits || 0} ${t(
          "Unit(s)"
        )}] - (SKU: ${option?.variant?.sku || "N/A"}) ${""}`;
      } else if (option?.variant?.type === "crate") {
        return `${option?.name?.ar || ""} ${
          option?.hasMultipleVariants ? option?.variant?.name?.ar : ""
        } [${t("Crate")} - ${option?.variant?.noOfUnits || 0} ${t(
          "Unit(s)"
        )}] - (SKU: ${option?.variant?.sku || "N/A"}) ${""}`;
      } else {
        return `${option?.name?.ar || ""} ${
          option?.hasMultipleVariants ? option?.variant?.name?.ar : ""
        } - (SKU: ${option?.variant?.sku || "N/A"}) ${""}`;
      }
    } else {
      if (option?.variant?.type === "box") {
        return `${option?.name?.en || ""} ${
          option?.hasMultipleVariants ? option?.variant?.name?.en : ""
        } [Box - ${option?.variant?.noOfUnits || 0} Unit(s)] - (SKU: ${
          option?.variant?.sku || "N/A"
        }) ${""}`;
      } else if (option?.variant?.type === "crate") {
        return `${option?.name?.en || ""} ${
          option?.hasMultipleVariants ? option?.variant?.name?.en : ""
        } [Crate - ${option?.variant?.noOfUnits || 0} Unit(s)] - (SKU: ${
          option?.variant?.sku || "N/A"
        }) ${""}`;
      } else {
        return `${option?.name?.en || ""} ${
          option?.hasMultipleVariants ? option?.variant?.name?.en : ""
        } - (SKU: ${option?.variant?.sku || "N/A"}) ${""}`;
      }
    }
  };

  const handleChangePrice = (index: number, val: any) => {
    const array: any | [] = [...barcodeData?.products];
    array[index]["labelPrint"] = val;
    setErrorIndex(-1);
    setBarcodeData({ ...barcodeData, products: array });
  };

  const handleExpiryDateChange = (index: number, val: any) => {
    const array: any | [] = [...barcodeData?.products];
    array[index]["expiryDate"] = val;
    setErrorIndex(-1);
    setBarcodeData({ ...barcodeData, products: array });
  };

  const handleRemoveProduct = (index: number) => {
    const array: any | [] = [...barcodeData?.products];
    array.splice(index, 1);
    setErrorIndex(-1);
    setBarcodeData({ ...barcodeData, products: array });
  };

  const paperSizeValue = BARCODE_PAPER_SIZES.find(
    (objOne) => objOne.key === barcodeData?.paperSize
  );

  const handleBarcodePrint = async () => {
    const printer = await repo.printer.findOneBy({
      enableBarcodes: true,
      printerType: "usb",
    });

    if (!printer) {
      showToast("info", t("Please configure label printer"));
      return;
    }

    const size = barcodeData?.paperSize?.split(",");

    if (
      !barcodeData?.locationName &&
      !barcodeData?.productNameEn &&
      // !barcodeData?.productNameAr &&
      !barcodeData?.price &&
      !barcodeData?.barcode &&
      !barcodeData?.expiry
    ) {
      showToast("error", t("Please select atleast one option"));
      return;
    }

    // if (size[1] === "25 mm") {
    //   if (
    //     barcodeData?.locationName &&
    //     barcodeData?.productNameEn &&
    //     barcodeData?.productNameAr &&
    //     barcodeData?.barcode &&
    //     (barcodeData?.price || barcodeData?.expiry)
    //   ) {
    //     showToast("error", t("Please select only 4 print parameters"));
    //     return;
    //   }
    // }

    if (barcodeData?.products?.length === 0) {
      showToast("error", t("Please select atleast one product"));
      return;
    }

    for (let i = 0; i < barcodeData?.products.length; i++) {
      if (!barcodeData?.products[i]?.labelPrint) {
        setErrorIndex(i);
        showToast("error", `${t("Label is required")} ${t("at row")} ${i + 1}`);
        return;
      }

      if (
        barcodeData?.products[i].batching &&
        !barcodeData?.products[i]?.expiryDate
      ) {
        setErrorIndex(i);
        showToast(
          "error",
          `${t("Expiry is required")} ${t("at row")} ${i + 1}`
        );
        return;
      }
    }

    const printTemplate: any = await repo.printTemplate.findOne({
      where: { locationRef: deviceContext.user.locationRef },
    });

    // const locationName = isRTL
    //   ? printTemplate.location.name.ar
    //   : printTemplate.location.name.en;

    const locationName = printTemplate.location.name.en;

    const response: boolean[] = [];

    labelPrintSuccessAlert();

    for (const product of barcodeData?.products) {
      const productNameEn = `${product.name.en}${
        product.hasMultipleVariants ? ` ${product.variant.name.en}` : ""
      }${
        product.variant.type === "box"
          ? ` x${product.variant.noOfUnits} Box`
          : product.variant.type === "crate"
          ? ` x${product.variant.noOfUnits} Crate`
          : ""
      }`;

      const productNameAr = `${product.name.ar}${
        product.hasMultipleVariants ? ` ${product.variant.name.ar}` : ""
      }${
        product.variant.type === "box"
          ? ` x${product.variant.noOfUnits} القطع`
          : product.variant.type === "crate"
          ? ` x${product.variant.noOfUnits} قفص`
          : ""
      }`;

      const data = {
        locationName: locationName,
        price: Number(product.variant?.sellingPrice || 0),
        productNameEn: productNameEn,
        productNameAr: productNameAr,
        sku: product.variant.sku,
        expiry: product?.expiryDate,
        labelPrint: product.labelPrint,
      };

      const tsplCommands = labelsTemplate(data);
      const res = TSCPrintLabel.print(tsplCommands, printer.vendor_id);

      if (res) {
        response.push(true);
      }
    }
  };

  const labelsTemplate = (data: BarcodeData) => {
    const size = barcodeData?.paperSize?.split(",");

    let tsplCommands = "";

    tsplCommands += `SIZE "${barcodeData?.paperSize}"\n`; // Set label size
    tsplCommands += `GAP "${size[1] === "25 mm" ? 2 : 4}" mm,0 mm\n`; // Set gap size
    tsplCommands += "SPEED 4\n"; // Set printing speed
    tsplCommands += "DIRECTION 1,0\n"; // Set printing direction
    tsplCommands += "VERTICAL 2 mm\n"; // Set vertical
    tsplCommands += "OFFSET 2 mm\n"; // Set offset
    tsplCommands += "DENSITY 7\n"; // Set density

    let left = 80;

    if (size[0] === "75 mm") {
      left = 120;
    }

    // Check and generate commands based on selected label size
    if (size[1] === "50 mm") {
      // Check and generate commands based on selected options
      if (barcodeData?.locationName) {
        tsplCommands += `TEXT 25,10,"2",0,1,1,"${data.locationName}"\n`;
      }

      if (barcodeData?.price && data?.price > 0) {
        tsplCommands += `TEXT 25,40,"2",0,1,1,"${"SAR"} ${data?.price?.toFixed(
          2
        )}"\n`;
      }

      if (barcodeData?.productNameEn) {
        tsplCommands += `TEXT 25,70,"2",0,1,1,"${data.productNameEn}"\n`;
      }

      // if (barcodeData?.productNameAr) {
      //   tsplCommands += `TEXT 25,100,"2",0,1,1,"${data.productNameAr}"\n`;
      // }

      if (barcodeData?.barcode) {
        tsplCommands += `BARCODE ${left},120,"128",90,1,0,2,3,"${data.sku}"\n`; //150

        if (barcodeData?.expiry && data?.expiry) {
          tsplCommands += `TEXT 25,260,"2",0,1,1,"Expiry: ${format(
            new Date(data.expiry),
            "d MMM yyyy"
          )}"\n`; //290
        }
      } else {
        tsplCommands += `TEXT 25,130,"2",0,1,1,"${data.sku}"\n`;

        if (barcodeData?.expiry && data?.expiry) {
          tsplCommands += `TEXT 25,160,"2",0,1,1,"Expiry: ${format(
            new Date(data.expiry),
            "d MMM yyyy"
          )}"\n`;
        }
      }
    } else if (size[1] === "38 mm") {
      // Check and generate commands based on selected options
      if (barcodeData?.locationName) {
        tsplCommands += `TEXT 25,20,"2",0,1,1,"${data.locationName}"\n`;
      }

      if (barcodeData?.price && data?.price > 0) {
        tsplCommands += `TEXT 25,60,"2",0,1,1,"${"SAR"} ${data?.price?.toFixed(
          2
        )}"\n`;
      }

      if (barcodeData?.productNameEn) {
        tsplCommands += `TEXT 25,100,"2",0,1,1,"${data.productNameEn}"\n`;
      }

      // if (barcodeData?.productNameAr) {
      //   tsplCommands += `TEXT 25,140,"2",0,1,1,"${"data.productNameAr"}"\n`;
      // }

      if (barcodeData?.barcode) {
        tsplCommands += `BARCODE ${left},145,"128",60,1,0,2,3,"${data.sku}"\n`; //175

        if (barcodeData?.expiry && data?.expiry) {
          tsplCommands += `TEXT 25,245,"2",0,1,1,"Expiry: ${format(
            new Date(data.expiry),
            "d MMM yyyy"
          )}"\n`; //275
        }
      } else {
        tsplCommands += `TEXT 25,180,"2",0,1,1,"${data.sku}"\n`;

        if (barcodeData?.expiry && data?.expiry) {
          tsplCommands += `TEXT 25,220,"2",0,1,1,"Expiry: ${format(
            new Date(data.expiry),
            "d MMM yyyy"
          )}"\n`;
        }
      }
    } else {
      // Check and generate commands based on selected options
      if (barcodeData?.locationName) {
        tsplCommands += `TEXT 20,15,"2",0,1,1,"${data.locationName}"\n`;
      }

      if (barcodeData?.price && data?.price > 0) {
        tsplCommands += `TEXT 20,45,"2",0,1,1,"${"SAR"} ${data?.price?.toFixed(
          2
        )}"\n`;

        if (barcodeData?.expiry && data?.expiry) {
          tsplCommands += `TEXT 175,45,"2",0,1,1,"| Exp:${format(
            new Date(data.expiry),
            "d/MM/yy"
          )}"\n`;
        }
      } else {
        if (barcodeData?.expiry && data?.expiry) {
          tsplCommands += `TEXT 20,45,"2",0,1,1,"Exp:${format(
            new Date(data.expiry),
            "d/MM/yy"
          )}"\n`;
        }
      }

      if (barcodeData?.productNameEn) {
        tsplCommands += `TEXT 20,75,"2",0,1,1,"${data.productNameEn}"\n`;
      }

      // if (barcodeData?.productNameAr) {
      //   tsplCommands += `TEXT 20,105,"2",0,1,1,"${data.productNameAr}"\n`;
      // }

      if (barcodeData?.barcode) {
        tsplCommands += `BARCODE ${left - 5},105,"128",50,1,0,2,3,"${
          data.sku
        }"\n`; //135
      } else {
        tsplCommands += `TEXT 25,135,"2",0,1,1,"${data.sku}"\n`;
      }
    }

    tsplCommands += "SET TEAR ON\n"; // Enable tear-off mode
    tsplCommands += `PRINT 1,${data.labelPrint}\n`; // Print and feed label
    tsplCommands += "CUT\n"; // Perform a cut
    tsplCommands += "CLS\n"; // Clear the buffer

    return tsplCommands;
  };

  const labelPrintSuccessAlert = async () => {
    await showAlert({
      confirmation: t("Confirmation"),
      alertMsg: t("barcode_print_success_alert"),
      btnText1: t("Close"),
      btnText2: t("Add Another"),
      onPressBtn1: () => {
        navigation.navigate("MoreHome");
      },
      onPressBtn2: () => {
        setBarcodeData({
          ...barcodeData,
          products: [] as any,
        });
      },
    });
  };

  const checkAllSelected = (
    location: boolean,
    productNameEn: boolean,
    // productNameAr: boolean,
    price: boolean,
    barcode: boolean,
    expiry: boolean
  ) => {
    return (
      location && productNameEn && price && barcode && expiry
      // location && productNameEn && productNameAr && price && barcode && expiry
    );
  };

  return (
    <>
      <CustomHeader />

      <TouchableOpacity
        style={{ position: "absolute", left: 100000 }}
        onPress={(e) => {
          e.preventDefault();
        }}
      >
        <Text>PRESS</Text>
      </TouchableOpacity>

      <ActionSheetHeader
        isClose={false}
        handleLeftBtn={() => navigation.navigate("MoreHome")}
        title={t("Barcode Print")}
        rightBtnText={t("Print")}
        permission={true}
        handleRightBtn={() => {
          handleBarcodePrint();
        }}
      />

      <ScrollView
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          marginTop: isKeyboardVisible ? "-5%" : "0%",
          paddingVertical: hp("3%"),
          paddingHorizontal: hp("2.5%"),
        }}
      >
        <View
          style={{
            marginHorizontal: wp("1.25%"),
            marginBottom: hp("2.5%"),
          }}
        >
          <DefaultText
            style={{ marginLeft: 12, marginBottom: 8 }}
            fontWeight="medium"
            fontSize="lg"
          >
            {t("Select Paper Size")}
          </DefaultText>

          <View
            style={{
              flexDirection: twoPaneView ? "row" : "column",
              alignItems: twoPaneView ? "center" : "flex-start",
              gap: wp("3%"),
            }}
          >
            <View style={{ width: "100%" }}>
              <SelectInput
                containerStyle={{
                  opacity: 1,
                  borderWidth: 0,
                  borderRadius: 12,
                }}
                style={{
                  fontSize: twoPaneView ? 20 : 18,
                }}
                isTwoText={false}
                isRightArrow={true}
                values={paperSizeValue}
                allowSearch={false}
                placeholderText={t("Paper Size")}
                options={BARCODE_PAPER_SIZES}
                handleChange={(val: any) => {
                  setBarcodeData({ ...barcodeData, paperSize: val?.key });
                }}
              />
            </View>

            {!twoPaneView && (
              <View style={{ width: twoPaneView ? wp("6%") : wp("25%") }}>
                <PrimaryButton
                  title={t("View")}
                  onPress={() => setOpenModal(true)}
                  style={{
                    borderRadius: 15,
                    paddingVertical: twoPaneView ? hp("2.25%") : 10,
                  }}
                  disabled={barcodeData?.paperSize === ""}
                />
              </View>
            )}
          </View>

          <DefaultText
            style={{ marginTop: hp("2%"), marginLeft: 12 }}
            fontSize="lg"
            fontWeight="medium"
            color={theme.colors.otherGrey[100]}
          >
            {`${t("Note")}: ${t(
              "Based on selected label size, you can select maximum of"
            )} ${
              barcodeData?.paperSize === "50 mm,25 mm" ||
              barcodeData?.paperSize === "75 mm,25 mm"
                ? 4
                : 5 //6
            } ${t("print parameters")}`}
          </DefaultText>
        </View>

        <View style={{ flexDirection: twoPaneView ? "row" : "column" }}>
          <View
            style={{
              flexDirection: "column",
              gap: 1,
              flex: 1,
              marginVertical: twoPaneView ? 0 : 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginHorizontal: "2%",
                marginVertical: "1%",
              }}
            >
              <BouncyCheckbox
                isChecked={barcodeData?.all}
                fillColor={theme.colors.white[1000]}
                unfillColor={theme.colors.white[1000]}
                iconComponent={
                  barcodeData?.all ? (
                    <ICONS.TickFilledIcon color={theme.colors.primary[1000]} />
                  ) : (
                    <ICONS.TickEmptyIcon color={theme.colors.primary[1000]} />
                  )
                }
                onPress={() =>
                  setBarcodeData({
                    ...barcodeData,
                    all: !barcodeData?.all,
                    locationName: !barcodeData?.all,
                    productNameEn: !barcodeData?.all,
                    // productNameAr: !barcodeData?.all,
                    price: !barcodeData?.all,
                    barcode: !barcodeData?.all,
                    expiry: !barcodeData?.all,
                  })
                }
              />

              <TouchableOpacity
                onPress={() =>
                  setBarcodeData({
                    ...barcodeData,
                    all: !barcodeData?.all,
                    locationName: !barcodeData?.all,
                    productNameEn: !barcodeData?.all,
                    // productNameAr: !barcodeData?.all,
                    price: !barcodeData?.all,
                    barcode: !barcodeData?.all,
                    expiry: !barcodeData?.all,
                  })
                }
              >
                <DefaultText fontSize="lg">{t("All")}</DefaultText>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginHorizontal: "2%",
                marginVertical: "1%",
              }}
            >
              <BouncyCheckbox
                isChecked={barcodeData?.locationName}
                fillColor={theme.colors.white[1000]}
                unfillColor={theme.colors.white[1000]}
                iconComponent={
                  barcodeData?.locationName ? (
                    <ICONS.TickFilledIcon color={theme.colors.primary[1000]} />
                  ) : (
                    <ICONS.TickEmptyIcon color={theme.colors.primary[1000]} />
                  )
                }
                onPress={() =>
                  setBarcodeData({
                    ...barcodeData,
                    locationName: !barcodeData?.locationName,
                    all: checkAllSelected(
                      !barcodeData?.locationName,
                      barcodeData?.productNameEn,
                      // barcodeData?.productNameAr,
                      barcodeData?.price,
                      barcodeData?.barcode,
                      barcodeData?.expiry
                    ),
                  })
                }
              />

              <TouchableOpacity
                onPress={() =>
                  setBarcodeData({
                    ...barcodeData,
                    locationName: !barcodeData?.locationName,
                    all: checkAllSelected(
                      !barcodeData?.locationName,
                      barcodeData?.productNameEn,
                      // barcodeData?.productNameAr,
                      barcodeData?.price,
                      barcodeData?.barcode,
                      barcodeData?.expiry
                    ),
                  })
                }
              >
                <DefaultText fontSize="lg">{t("Location Name")}</DefaultText>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginHorizontal: "2%",
                marginVertical: "1%",
              }}
            >
              <BouncyCheckbox
                isChecked={barcodeData?.productNameEn}
                fillColor={theme.colors.white[1000]}
                unfillColor={theme.colors.white[1000]}
                iconComponent={
                  barcodeData?.productNameEn ? (
                    <ICONS.TickFilledIcon color={theme.colors.primary[1000]} />
                  ) : (
                    <ICONS.TickEmptyIcon color={theme.colors.primary[1000]} />
                  )
                }
                onPress={() =>
                  setBarcodeData({
                    ...barcodeData,
                    productNameEn: !barcodeData?.productNameEn,
                    all: checkAllSelected(
                      barcodeData?.locationName,
                      !barcodeData?.productNameEn,
                      // barcodeData?.productNameAr,
                      barcodeData?.price,
                      barcodeData?.barcode,
                      barcodeData?.expiry
                    ),
                  })
                }
              />

              <TouchableOpacity
                onPress={() =>
                  setBarcodeData({
                    ...barcodeData,
                    productNameEn: !barcodeData?.productNameEn,
                    all: checkAllSelected(
                      barcodeData?.locationName,
                      !barcodeData?.productNameEn,
                      // barcodeData?.productNameAr,
                      barcodeData?.price,
                      barcodeData?.barcode,
                      barcodeData?.expiry
                    ),
                  })
                }
              >
                <DefaultText fontSize="lg">
                  {t("Product name english")}
                </DefaultText>
              </TouchableOpacity>
            </View>

            {/* <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginHorizontal: "2%",
                marginVertical: "1%",
              }}
            >
              <BouncyCheckbox
                isChecked={barcodeData?.productNameAr}
                fillColor={theme.colors.white[1000]}
                unfillColor={theme.colors.white[1000]}
                iconComponent={
                  barcodeData?.productNameAr ? (
                    <ICONS.TickFilledIcon color={theme.colors.primary[1000]} />
                  ) : (
                    <ICONS.TickEmptyIcon color={theme.colors.primary[1000]} />
                  )
                }
                onPress={() =>
                  setBarcodeData({
                    ...barcodeData,
                    productNameAr: !barcodeData?.productNameAr,
                    all: checkAllSelected(
                      barcodeData?.locationName,
                      barcodeData?.productNameEn,
                      !barcodeData?.productNameAr,
                      barcodeData?.price,
                      barcodeData?.barcode,
                      barcodeData?.expiry
                    ),
                  })
                }
              />

              <TouchableOpacity
                onPress={() =>
                  setBarcodeData({
                    ...barcodeData,
                    productNameAr: !barcodeData?.productNameAr,
                    all: checkAllSelected(
                      barcodeData?.locationName,
                      barcodeData?.productNameEn,
                      !barcodeData?.productNameAr,
                      barcodeData?.price,
                      barcodeData?.barcode,
                      barcodeData?.expiry
                    ),
                  })
                }
              >
                <DefaultText fontSize="lg">
                  {t("Product name arabic")}
                </DefaultText>
              </TouchableOpacity>
            </View> */}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginHorizontal: "2%",
                marginVertical: "1%",
              }}
            >
              <BouncyCheckbox
                isChecked={barcodeData?.price}
                fillColor={theme.colors.white[1000]}
                unfillColor={theme.colors.white[1000]}
                iconComponent={
                  barcodeData?.price ? (
                    <ICONS.TickFilledIcon color={theme.colors.primary[1000]} />
                  ) : (
                    <ICONS.TickEmptyIcon color={theme.colors.primary[1000]} />
                  )
                }
                onPress={() =>
                  setBarcodeData({
                    ...barcodeData,
                    price: !barcodeData?.price,
                    all: checkAllSelected(
                      barcodeData?.locationName,
                      barcodeData?.productNameEn,
                      // barcodeData?.productNameAr,
                      !barcodeData?.price,
                      barcodeData?.barcode,
                      barcodeData?.expiry
                    ),
                  })
                }
              />

              <TouchableOpacity
                onPress={() =>
                  setBarcodeData({
                    ...barcodeData,
                    price: !barcodeData?.price,
                    all: checkAllSelected(
                      barcodeData?.locationName,
                      barcodeData?.productNameEn,
                      // barcodeData?.productNameAr,
                      !barcodeData?.price,
                      barcodeData?.barcode,
                      barcodeData?.expiry
                    ),
                  })
                }
              >
                <DefaultText fontSize="lg">{t("Price")}</DefaultText>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginHorizontal: "2%",
                marginVertical: "1%",
              }}
            >
              <BouncyCheckbox
                isChecked={barcodeData?.barcode}
                fillColor={theme.colors.white[1000]}
                unfillColor={theme.colors.white[1000]}
                iconComponent={
                  barcodeData?.barcode ? (
                    <ICONS.TickFilledIcon color={theme.colors.primary[1000]} />
                  ) : (
                    <ICONS.TickEmptyIcon color={theme.colors.primary[1000]} />
                  )
                }
                onPress={() =>
                  setBarcodeData({
                    ...barcodeData,
                    barcode: !barcodeData?.barcode,
                    all: checkAllSelected(
                      barcodeData?.locationName,
                      barcodeData?.productNameEn,
                      // barcodeData?.productNameAr,
                      barcodeData?.price,
                      !barcodeData?.barcode,
                      barcodeData?.expiry
                    ),
                  })
                }
              />

              <TouchableOpacity
                onPress={() =>
                  setBarcodeData({
                    ...barcodeData,
                    barcode: !barcodeData?.barcode,
                    all: checkAllSelected(
                      barcodeData?.locationName,
                      barcodeData?.productNameEn,
                      // barcodeData?.productNameAr,
                      barcodeData?.price,
                      !barcodeData?.barcode,
                      barcodeData?.expiry
                    ),
                  })
                }
              >
                <DefaultText fontSize="lg">{t("Barcode")}</DefaultText>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginHorizontal: "2%",
                marginVertical: "1%",
              }}
            >
              <BouncyCheckbox
                isChecked={barcodeData?.expiry}
                fillColor={theme.colors.white[1000]}
                unfillColor={theme.colors.white[1000]}
                iconComponent={
                  barcodeData?.expiry ? (
                    <ICONS.TickFilledIcon color={theme.colors.primary[1000]} />
                  ) : (
                    <ICONS.TickEmptyIcon color={theme.colors.primary[1000]} />
                  )
                }
                onPress={() =>
                  setBarcodeData({
                    ...barcodeData,
                    expiry: !barcodeData?.expiry,
                    all: checkAllSelected(
                      barcodeData?.locationName,
                      barcodeData?.productNameEn,
                      // barcodeData?.productNameAr,
                      barcodeData?.price,
                      barcodeData?.barcode,
                      !barcodeData?.expiry
                    ),
                  })
                }
              />

              <TouchableOpacity
                onPress={() =>
                  setBarcodeData({
                    ...barcodeData,
                    expiry: !barcodeData?.expiry,
                    all: checkAllSelected(
                      barcodeData?.locationName,
                      barcodeData?.productNameEn,
                      // barcodeData?.productNameAr,
                      barcodeData?.price,
                      barcodeData?.barcode,
                      !barcodeData?.expiry
                    ),
                  })
                }
              >
                <DefaultText fontSize="lg">{t("Expiry")}</DefaultText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            {twoPaneView && barcodeData?.paperSize !== "" && (
              <View
                style={{
                  marginHorizontal: wp("2%"),
                }}
              >
                <WideBarcode data={barcodeData} />
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={{
            borderRadius: 16,
            height: hp("7.5%"),
            flexDirection: "row",
            alignItems: "center",
            marginVertical: "1%",
            marginTop: hp("2.5%"),
            paddingHorizontal: 16,
            marginHorizontal: "1.5%",
            justifyContent: "space-between",
            backgroundColor: theme.colors.white[1000],
          }}
          onPress={() => {
            productSelectInputRef.current.open();
          }}
        >
          <DefaultText fontWeight="normal" color={theme.colors.placeholder}>
            {t("Products")}
          </DefaultText>

          <View
            style={{
              transform: [{ rotate: isRTL ? "180deg" : "0deg" }],
            }}
          >
            <ICONS.RightContentIcon />
          </View>
        </TouchableOpacity>

        <View style={{ marginHorizontal: "2%", marginVertical: "1%" }}>
          <FlatList
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={Keyboard.dismiss}
            data={barcodeData?.products}
            renderItem={({ index, item: pr }) => {
              return (
                <View
                  key={index}
                  style={{
                    flexDirection: twoPaneView ? "row" : "column",
                    gap: 10,
                    justifyContent: twoPaneView ? "space-between" : "center",
                    alignItems: twoPaneView ? "center" : "flex-start",
                    marginVertical: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <View style={{ width: twoPaneView ? "60%" : "100%" }}>
                    <DefaultText>{getOptionLabel(pr)}</DefaultText>
                  </View>

                  {twoPaneView ? (
                    <>
                      <View style={{ width: "15%" }}>
                        <Input
                          values={pr.labelPrint}
                          handleChange={(val: any) => {
                            if (val === "" || /^[0-9\b]+$/.test(val)) {
                              handleChangePrice(index, val);
                            }
                          }}
                          keyboardType="number-pad"
                          placeholderText={t("Label")}
                        />
                        <ErrorText
                          errors={
                            (!pr.labelPrint && index === errorIndex) as Boolean
                          }
                          title={t("Label is required")}
                        />
                      </View>

                      <View style={{ width: "12%" }}>
                        <DateInput
                          rightIcon={false}
                          handleChange={(val: any) =>
                            handleExpiryDateChange(index, val)
                          }
                          placeholderText={t("Expiry")}
                          disabled={!Boolean(pr?.batching)}
                          mode="date"
                          dateFormat="dd/MM/yyyy"
                          minimumDate={new Date()}
                          values={pr.expiryDate}
                        />
                        <ErrorText
                          errors={
                            (!pr.expiryDate && index === errorIndex) as Boolean
                          }
                          title={t("Expiry is required")}
                        />
                      </View>

                      <View style={{ width: wp("5%") }}>
                        <PrimaryButton
                          title=""
                          onPress={() => handleRemoveProduct(index)}
                          style={{
                            borderRadius: 8,
                            paddingVertical: hp("1.5%"),
                            backgroundColor: theme.colors.red.default,
                          }}
                          leftIcon={
                            <TrashIcon height={hp("3%")} width={hp("3%")} />
                          }
                        />
                      </View>
                    </>
                  ) : (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                        alignItems: "center",
                      }}
                    >
                      <View style={{ width: "40%" }}>
                        <Input
                          values={pr.labelPrint}
                          handleChange={(val: any) => {
                            if (val === "" || /^[0-9\b]+$/.test(val)) {
                              handleChangePrice(index, val);
                            }
                          }}
                          keyboardType="number-pad"
                          placeholderText={t("Label")}
                        />
                        <ErrorText
                          errors={
                            (!pr.labelPrint && index === errorIndex) as Boolean
                          }
                          title={t("Label is required")}
                        />
                      </View>

                      <View style={{ width: "40%" }}>
                        <DateInput
                          rightIcon={false}
                          handleChange={(val: any) =>
                            handleExpiryDateChange(index, val)
                          }
                          placeholderText={t("Expiry")}
                          disabled={!Boolean(pr?.batching)}
                          mode="date"
                          dateFormat="dd/MM/yyyy"
                          minimumDate={new Date()}
                          values={pr.expiryDate}
                        />
                        <ErrorText
                          errors={
                            (!pr.expiryDate && index === errorIndex) as Boolean
                          }
                          title={t("Expiry is required")}
                        />
                      </View>

                      <View style={{ width: wp("12%") }}>
                        <PrimaryButton
                          title=""
                          onPress={() => handleRemoveProduct(index)}
                          style={{
                            borderRadius: 8,
                            paddingVertical: 10,
                            backgroundColor: theme.colors.red.default,
                          }}
                          leftIcon={
                            <TrashIcon height={hp("2.5%")} width={hp("2.5%")} />
                          }
                        />
                      </View>
                    </View>
                  )}
                </View>
              );
            }}
            ListHeaderComponent={twoPaneView ? PrintListHeader : <></>}
          />
        </View>

        <Spacer space={hp("12%")} />
      </ScrollView>

      <ProductSelectInput
        barcodeData={barcodeData}
        sheetRef={productSelectInputRef}
        handleSelected={(item: any) => {
          if (item) {
            const newObj = { ...item };
            const newProduct: any = [...barcodeData?.products];
            newProduct.push(newObj);
            setBarcodeData({ ...barcodeData, products: newProduct });
            productSelectInputRef.current.close();
          }
        }}
      />

      {openModal && !twoPaneView && (
        <PrintTemplateViewModal
          visible={openModal}
          data={barcodeData}
          handleClose={() => {
            setOpenModal(false);
          }}
        />
      )}
    </>
  );
};

export default BarcodePrinting;
