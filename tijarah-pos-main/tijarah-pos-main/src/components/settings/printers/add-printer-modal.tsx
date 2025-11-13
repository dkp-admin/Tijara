import * as ExpoPrintHelp from "expo-print-help";
import { FormikProps, useFormik } from "formik";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import Checkbox from "react-native-bouncy-checkbox";
import { EventRegister } from "react-native-event-listeners";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { t } from "../../../../i18n";
import AuthContext from "../../../context/auth-context";
import DeviceContext from "../../../context/device-context";
import { useTheme } from "../../../context/theme-context";
import { PrinterRepository } from "../../../database/printer/printer-repo";
import { checkDirection } from "../../../hooks/check-direction";
import { useResponsive } from "../../../hooks/use-responsiveness";
import useCommonApis from "../../../hooks/useCommonApis";
import { queryClient } from "../../../query-client";
import { AuthType } from "../../../types/auth-types";
import { objectId } from "../../../utils/bsonObjectIdTransformer";
import { getErrorMsg } from "../../../utils/common-error-msg";
import { db, repo } from "../../../utils/createDatabaseConnection";
import ICONS from "../../../utils/icons";
import { debugLog, errorLog } from "../../../utils/log-patch";
import ActionSheetHeader from "../../action-sheet/action-sheet-header";
import { PrimaryButton } from "../../buttons/primary-button";
import Input from "../../input/input";
import SelectInput from "../../input/select-input";
import Spacer from "../../spacer";
import DefaultText from "../../text/Text";
import ErrorText from "../../text/error-text";
import Label from "../../text/label";
import showToast from "../../toast";
import KitchenSelectInput from "./kitchen-select-input";

type AddPrinterProps = {
  name: string;
  type: string;
  modal: { value: string; key: string };
  size: { value: string; key: string };
  printerWidthMM: { value: string; key: string };
  otherPrinterWidth: string;
  charsPerLine: { value: string; key: string };
  otherCharsLine: string;
  receipts: boolean;
  kot: boolean;
  barcodes: boolean;
  kitchen: { value: string; key: string };
};

const inbuiltPrinterOption = [
  { value: "Neoleap", key: "neoleap" },
  { value: "Sunmi", key: "sunmi" },
];
const usbSizeOptions = [{ value: "3 Inch", key: "3-inch" }];
const inbuiltSizeOptions = [
  { value: "2 Inch", key: "2-inch" },
  { value: "3 Inch", key: "3-inch" },
];
const printerWidthMMOptions = [
  { value: "72", key: "72" },
  { value: "77", key: "77" },
  { value: "Custom", key: "other" },
];
const charsPerLineOptions = [
  { value: "44", key: "44" },
  { value: "48", key: "48" },
  { value: "Custom", key: "other" },
];

const order = {
  _id: "6554a8af94e3b675b2e0f14f",
  qr: "AQZTaGFoaWQCDjEyMzQ1Njc4OTEwMTExAxAyMDIyLTAxLTAyIDEwOjMwBAYxMDAuMDAFBTE1LjAw",
  tokenNumber: 10,
  orderType: "Walk-in",
  company: { name: "Sarah Store for foodstuffs" },
  orderNum: "FM9JDE",
  showToken: true,
  showOrderType: true,
  specialInstructions: "",
  deviceRef: "65266e477878e27182cc326e",
  device: { deviceCode: "2N8XV846" },
  cashier: { name: "Arshad" },
  cashierRef: "652671bf7878e27182cc3471",
  companyRef: "652656377878e27182cc0b42",
  locationRef: "652657137878e27182cc0c5c",
  customer: {
    name: "Test",
    vat: "310234504400033",
  },
  location: {
    name: {
      en: "Sarah Store For foodstuffs - Sahafa branch",
      ar: "سمير كيمونو بوبس",
    },
    vat: "310000004400033",
    phone: "+966-885888307",
    address: "Hitech City, Hyderabad",
    invoiceFooter: "Thank You",
    customText: "CUSTOM TEXT",
    returnPolicy: "RETURN POLICY",
  },
  items: [
    {
      productRef: "65266cd502a600cd9a63962c",
      categoryRef: "65266a885d7c170773a0ae80",
      name: {
        en: "Mouchoir soft facial tissues 180 sheets",
        ar: "مناديل وجه ناعمة مشوار ١٨٠ منديل مزدوج",
      },
      contains: "",
      modifierName: "",
      category: { name: "Miscellaneous" },
      image: "",
      quantity: 1,
      unitPrice: "2.61",
      modifiers: [],
      promotionsData: [],
      hasMultipleVariants: false,
      billing: {
        total: "3.00",
        subTotal: "2.61",
        vatAmount: "0.39",
        vatPercentage: "15",
        discountAmount: "0",
        discountPercentage: "0",
        promotionRefs: [],
      },
      variant: {
        name: {
          en: "Regular",
          ar: "عادي",
        },
        stock: {
          availability: true,
          count: 0,
          tracking: false,
        },
        sku: "6281101545544",
        parentSku: "",
        type: "item",
        unit: "perItem",
        unitCount: 1,
        costPrice: "0",
        sellingPrice: "2.61",
      },
    },
  ],
  payment: {
    total: "7.50",
    subTotal: "6.52",
    vatAmount: "0.98",
    vatPercentage: "13",
    discountCode: "",
    discountAmount: "20.01",
    discountPercentage: "0",
    subTotalWithoutDiscount: "6.52",
    vatWithoutDiscount: "0.98",
    charges: [
      {
        name: { en: "TEST CHARGE", ar: "رسوم الاختبار" },
        total: "20.39",
        vat: "0.99",
        type: "percentage",
        chargeType: "fixed",
        value: "13",
        chargeId: "6627587e3bcf91b46802c997",
      },
    ],
    breakup: [
      {
        name: "Cash",
        total: "20.23",
        refId: "Cash",
        providerName: "Cash",
        change: "0.00",
        _id: "6554a8b1a1008c796abdf5f2",
      },
    ],
  },
  refunds: [],
  createdAt: "2023-11-15T11:17:05.541Z",
  time: "02:05:29PM",
  updatedAt: "2023-11-15T11:17:05.541Z",
};

export default function AddEditPrinterModal({
  data,
  visible = false,
  handleClose,
}: {
  data: any;
  visible: boolean;
  handleClose?: any;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const authContext = useContext<AuthType>(AuthContext);
  const deviceContext = useContext<any>(DeviceContext);
  const { businessData } = useCommonApis();
  const { hp, twoPaneView } = useResponsive();
  const kitchenSelectInputRef = useRef<any>();
  const printerRepository = new PrinterRepository(db);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState("") as any;
  const [printers, setPrinters] = useState([]) as any;
  const [addedPrinter, setAddedPrinter] = useState([]) as any;
  const [connectedDevices, setConnectedDevices] = useState([]) as any;

  const formik: FormikProps<AddPrinterProps> = useFormik<AddPrinterProps>({
    initialValues: {
      name: "",
      type: "usb",
      modal: { value: "", key: "" },
      size: { value: "3 Inch", key: "3-inch" },
      printerWidthMM: { value: "77", key: "77" },
      otherPrinterWidth: "",
      charsPerLine: { value: "48", key: "48" },
      otherCharsLine: "",
      receipts: true,
      kot: false,
      barcodes: false,
      kitchen: { value: "", key: "" },
    },

    onSubmit: async (values, { resetForm }) => {
      if (!values.modal.key) {
        showToast("error", t("Please Select Printer Modal"));
        return;
      }

      if (values.type === "usb") {
        if (!values.printerWidthMM.key) {
          showToast("error", t("Please select printer width"));
          return;
        } else if (
          values.printerWidthMM.key === "other" &&
          values.otherPrinterWidth === ""
        ) {
          showToast("error", t("Other printer width is required"));
          return;
        }

        if (!values.charsPerLine.key) {
          showToast("error", t("Please select print characters"));
          return;
        } else if (
          values.charsPerLine.key === "other" &&
          values.otherCharsLine === ""
        ) {
          showToast("error", t("Other print characters is required"));
          return;
        }
      }

      if (
        businessData?.company?.industry?.toLowerCase() === "restaurant" &&
        businessData?.company?.enableKitchenManagement &&
        values.kot &&
        !values.kitchen.key
      ) {
        showToast("error", t("Please select kitchen"));
        return;
      }

      try {
        if (data?.isAdd) {
          const data = {
            _id: objectId(),
            name: values.name,
            printerType: values.type,
            printerSize: values.size.key,
            enableBarcodes: values.barcodes,
            enableKOT: values.kot,
            enableReceipts: values.receipts,
            device_id: values.modal.key,
            device_name: values.modal.value,
            product_id: selectedPrinter?.product_id || "inbuilt",
            vendor_id: selectedPrinter?.vendor_id || "inbuilt",
            printerWidthMM:
              values.printerWidthMM.key === "other"
                ? values.otherPrinterWidth
                : values.printerWidthMM.key,
            charsPerLine:
              values.charsPerLine.key === "other"
                ? values.otherCharsLine
                : values.charsPerLine.key,
            kitchenRef: values.kitchen.key,
            kitchen: { name: values.kitchen.value },
          };

          await repo.printer.insert(data).then(async (r) => {
            debugLog(
              "Printer added to db",
              data,
              "setting-printer-screen",
              "handleSubmitFunction"
            );
            EventRegister.emit("print-changed", {
              enableReceipts: data.enableReceipts,
              enableKOT: data.enableKOT,
            });

            if (
              businessData?.company?.industry?.toLowerCase() === "restaurant" &&
              businessData?.company?.enableKitchenManagement &&
              values.kot &&
              values.kitchen.key
            ) {
              const kitchenData = await repo.kitchenManagement.findOne({
                where: { _id: values.kitchen.key },
              });

              if (kitchenData?._id) {
                await repo.kitchenManagement.update(
                  { _id: kitchenData._id },
                  {
                    ...kitchenData,
                    source: "local",
                    printerName: values.name,
                    printerAssigned: true,
                    deviceRef: deviceContext.user.deviceRef,
                    device: { deviceCode: deviceContext.user.phone },
                  }
                );
              }
            }

            handleClose();
          });
          await queryClient.invalidateQueries("find-printers");
        } else {
          const dataObj = {
            _id: data?.printer?._id,
            name: values.name,
            printerType: values.type,
            printerSize: values.size.key,
            enableBarcodes: values.barcodes,
            enableKOT: values.kot,
            enableReceipts: values.receipts,
            device_id: values.modal.key,
            device_name: values.modal.value,
            product_id: selectedPrinter?.product_id || "inbuilt",
            vendor_id: selectedPrinter?.vendor_id || "inbuilt",
            printerWidthMM:
              values.printerWidthMM.key === "other"
                ? values.otherPrinterWidth
                : values.printerWidthMM.key,
            charsPerLine:
              values.charsPerLine.key === "other"
                ? values.otherCharsLine
                : values.charsPerLine.key,
            kitchenRef: values.kitchen.key,
            kitchen: { name: values.kitchen.value },
          };

          await repo.printer
            .update({ _id: data?.printer?._id }, dataObj)
            .then(async (r) => {
              debugLog(
                "Printer updated to db",
                dataObj,
                "setting-printer-screen",
                "handleSubmitFunction"
              );
              EventRegister.emit("print-changed", {
                enableReceipts: dataObj.enableReceipts,
                enableKOT: dataObj.enableKOT,
              });

              if (
                businessData?.company?.industry?.toLowerCase() ===
                  "restaurant" &&
                businessData?.company?.enableKitchenManagement &&
                values.kot &&
                values.kitchen.key
              ) {
                const kitchenData = await repo.kitchenManagement.findOne({
                  where: { _id: values.kitchen.key },
                });

                if (kitchenData?._id) {
                  await repo.kitchenManagement.update(
                    { _id: kitchenData._id },
                    {
                      ...kitchenData,
                      source: "local",
                      printerName: values.name,
                      printerAssigned: true,
                      deviceRef: deviceContext.user.deviceRef,
                      device: { deviceCode: deviceContext.user.phone },
                    }
                  );
                }
              } else if (
                businessData?.company?.industry?.toLowerCase() ===
                  "restaurant" &&
                businessData?.company?.enableKitchenManagement &&
                !values.kot &&
                values.kitchen.key
              ) {
                const kitchenData = await repo.kitchenManagement.findOne({
                  where: { _id: values.kitchen.key },
                });

                if (kitchenData) {
                  await repo.kitchenManagement.update(
                    { _id: kitchenData._id },
                    {
                      ...kitchenData,
                      source: "local",
                      printerName: "",
                      printerAssigned: false,
                      deviceRef: "",
                      device: { deviceCode: "" },
                    }
                  );
                }
              }

              handleClose();
            });
          await queryClient.invalidateQueries("find-printers");
        }

        showToast(
          "success",
          data.isAdd
            ? t("Printer Added Successfully")
            : t("Printer Updated Successfully")
        );
        resetForm();
        handleClose();
      } catch (error: any) {
        errorLog(
          error?.message,
          selectedPrinter,
          "setting-printer-screen",
          "handleSubmitFunction",
          error
        );

        if (data.isAdd) {
          showToast("error", getErrorMsg("printer", "create"));
        } else {
          showToast("error", getErrorMsg("printer", "update"));
        }
      }
    },

    validationSchema: Yup.object().shape({
      name: Yup.string().required(t("Printer Name is required")),
    }),
  });

  const handleTestPrint = async (printer: any) => {
    let printContent =
      `[C]<b>${order?.location?.name?.en}</b>\n` +
      `[C]<img>${ExpoPrintHelp.imageToHex(
        `${order?.location?.name?.ar}                                     `,
        "center",
        "20"
      )}</img>\n` +
      `[C]VAT No. ${order.location.vat}\n` +
      `[C]PH No. ${order?.location?.phone}\n` +
      `[C]<img>${ExpoPrintHelp.imageToHex(
        `${order?.location?.address}                               `,
        "center",
        "20"
      )}</img>\n` +
      `[C]------------------------------------------------\n` +
      `[L]Invoice[R]#${order?.orderNum}\n` +
      `[L]<img>${ExpoPrintHelp.imageToHex("فاتورة", "left", "20")}</img>\n` +
      `[L]Date & time[R]${order?.createdAt}\n` +
      `[L]<img>${ExpoPrintHelp.imageToHex(
        "التاريخ والوقت",
        "left",
        "20"
      )}</img>\n` +
      `[L]Customer[R]${order.customer.name}\n` +
      `[L]<img>${ExpoPrintHelp.imageToHex("العميل", "left", "20")}</img>\n` +
      `[L]Customer VAT[R]${order.customer.vat}\n` +
      `[L]<img>${ExpoPrintHelp.imageToHex(
        "العميل VAT",
        "left",
        "20"
      )}</img>\n` +
      `[C]------------------------------------------------\n` +
      `[C]<font size='big'>${order?.tokenNumber}</font>\n` +
      `[C]${order?.orderType}\n` +
      `[C]------------------------------------------------\n` +
      `[C]<b>Simplified Tax Invoice</b>\n` +
      `[C]<img>${ExpoPrintHelp.imageToHex(
        "فاتورة ضريبية مبسطة                                ",
        "left",
        "20"
      )}</img>\n` +
      `[C]------------------------------------------------\n` +
      `[L]Description\n` +
      `[L]<img>${ExpoPrintHelp.imageToHex("الوصف", "left", "20")}</img>\n` +
      `[L]Unit Price[C]Qty[R]Total\n` +
      `[L]<img>${ExpoPrintHelp.imageToHex(
        "إجمالي                                   الكمية                        سعر الوحدة",
        "left",
        "20"
      )}</img>\n` +
      `[C]------------------------------------------------\n`;

    order?.items?.map((item: any) => {
      printContent +=
        `[L]${item.name.en}\n` +
        `[L]<img>${ExpoPrintHelp.imageToHex(
          `${item.name.ar}`,
          "left",
          "20"
        )}</img>\n` +
        `[L]${item.unitPrice}[C]${item.quantity}[R]${item.billing.total}\n`;
    });

    printContent +=
      `[C]------------------------------------------------\n` +
      `[L]Items Total[R]SAR ${order.payment.subTotalWithoutDiscount}\n` +
      `[L]<img>${ExpoPrintHelp.imageToHex(
        "إجمالي العناصر",
        "left",
        "20"
      )}</img>\n` +
      `[L]Total Discount[R]SAR ${order.payment.discountAmount}\n` +
      `[L]<img>${ExpoPrintHelp.imageToHex(
        "إجمالي الخصم",
        "left",
        "20"
      )}</img>\n` +
      `[C]------------------------------------------------\n` +
      `[L]Total Taxable Amount[R]SAR ${order.payment.subTotal}\n` +
      `[L]<img>${ExpoPrintHelp.imageToHex(
        "الإجمالي الخاضع للضریبة",
        "left",
        "20"
      )}</img>\n`;

    order?.payment?.charges?.map((charge: any) => {
      printContent +=
        `[L]${charge.name.en}[R]SAR ${charge.total}\n` +
        `[L]<img>${ExpoPrintHelp.imageToHex(
          `${charge.name.ar}`,
          "left",
          "20"
        )}</img>\n`;
    });

    printContent +=
      `[L]Total VAT[R]SAR ${order.payment.vatAmount}\n` +
      `[L]<img>${ExpoPrintHelp.imageToHex(
        "إجمالي ضريبة القيمة المضافة",
        "left",
        "20"
      )}</img>\n` +
      `[C]------------------------------------------------\n` +
      `[L]Total Amount[R]SAR ${order.payment.total}\n` +
      `[L]<img>${ExpoPrintHelp.imageToHex(
        "المبلغ الإجمالي",
        "left",
        "20"
      )}</img>\n` +
      `[C]------------------------------------------------\n`;

    order?.payment?.breakup?.map((breakup: any) => {
      printContent += `[L]${breakup.name}[R]SAR ${breakup.total}\n`;
    });

    printContent +=
      `[C]------------------------------------------------\n` +
      `[C]<b>Return Policy</b>\n` +
      `[L]${order.location.returnPolicy}\n` +
      `[C]------------------------------------------------\n` +
      `[L]${order.location.customText}\n` +
      `[C]------------------------------------------------\n` +
      `[C]<barcode type='128' height='10'>${order?.orderNum}</barcode>\n` +
      `[C]------------------------------------------------\n` +
      `[L]<qrcode size='25'>${order?.qr}</qrcode>\n` +
      `[C]------------------------------------------------\n` +
      `[C]${order?.location?.invoiceFooter || "Thank You"}\n` +
      `\n[C]<b>Powered by Tijarah360</b>\n\n` +
      `[L]\n` +
      `[L]\n` +
      `[L]\n`;

    await ExpoPrintHelp.printRaw(
      printContent,
      `${printer?.printerWidthMM || "72"}`,
      "199",
      `${printer?.charsPerLine || "44"}`
    );
    await ExpoPrintHelp.cut();
  };

  const handleTestKOT = async (printer: any) => {
    let kotContent =
      `[C]<b>${order?.location?.name?.en}</b>\n` +
      `[C]<img>${ExpoPrintHelp.imageToHex(
        `${order?.location?.name?.ar}                                     `,
        "center",
        "20"
      )}</img>\n` +
      `[C]<img>${ExpoPrintHelp.imageToHex(
        `${order?.location?.address}                               `,
        "center",
        "20"
      )}</img>\n` +
      `[C]------------------------------------------------\n` +
      `[L]Invoice[R]#${order?.orderNum}\n` +
      `[L]<img>${ExpoPrintHelp.imageToHex(
        "رقم الفاتورة",
        "left",
        "20"
      )}</img>\n` +
      `[L]Date & time[R]${order?.createdAt}\n` +
      `[L]<img>${ExpoPrintHelp.imageToHex(
        "التاريخ والوقت",
        "left",
        "20"
      )}</img>\n` +
      `[C]------------------------------------------------\n` +
      `[C]<font size='big'>${order?.tokenNumber}</font>\n` +
      `[C]${order?.orderType}\n` +
      `[C]------------------------------------------------\n` +
      `[C]<b>KOT</b>\n` +
      `[C]------------------------------------------------\n` +
      `[L]Description[R]Qty\n` +
      `[L]<img>${ExpoPrintHelp.imageToHex(
        "الكمية                                                                             الوصف",
        "left",
        "20"
      )}</img>\n` +
      `[C]------------------------------------------------\n`;

    order?.items?.map((item: any) => {
      kotContent +=
        `[L]${item.name.en}[R]${item?.quantity}\n` +
        `[L]<img>${ExpoPrintHelp.imageToHex(
          `${item.name.ar}`,
          "left",
          "20"
        )}</img>\n`;
    });

    kotContent +=
      `[C]------------------------------------------------\n` +
      `[L]Total QTY[R]${1}\n` +
      `[L]<img>${ExpoPrintHelp.imageToHex(
        "إجمالي الكمية",
        "left",
        "20"
      )}</img>\n`;

    kotContent += `[L]\n` + `[L]\n` + `[L]\n`;

    await ExpoPrintHelp.printRaw(
      kotContent,
      `${printer?.printerWidthMM || "72"}`,
      "199",
      `${printer?.charsPerLine || "44"}`
    );
    await ExpoPrintHelp.cut();
  };

  useEffect(() => {
    printerRepository.printers().then((deviceList) => {
      setConnectedDevices([...deviceList]);
    });
  }, []);

  useEffect(() => {
    repo.printer.find({}).then((deviceList) => {
      setAddedPrinter([...deviceList]);
    });
  }, []);

  useEffect(() => {
    debugLog(
      "Connected Devices printer",
      JSON.stringify(connectedDevices),
      "setting-printer-screen",
      "handlePrinterFunction"
    );

    debugLog(
      "Added printer",
      JSON.stringify(addedPrinter),
      "setting-printer-screen",
      "handlePrinterFunction"
    );

    const filteredAdded = connectedDevices.filter((device: any) => {
      const idx = addedPrinter?.findIndex(
        (d: any) => d?.product_id === device?.product_id
      );
      return idx == -1;
    });

    debugLog(
      "Filtered printer",
      JSON.stringify(filteredAdded),
      "setting-printer-screen",
      "handlePrinterFunction"
    );

    setPrinters(filteredAdded);
  }, [addedPrinter, connectedDevices]);

  useEffect(() => {
    if (visible) {
      formik.resetForm();
      setIsEditing(data.isAdd);
    }
  }, [visible]);

  useEffect(() => {
    if (!data?.isAdd) {
      formik.setValues({
        ...data?.printer,
        barcodes: data?.printer?.enableBarcodes,
        receipts: data?.printer?.enableReceipts,
        kot: data?.printer?.enableKOT,
        type: data?.printer?.printerType,
        modal: {
          key: data?.printer?.device_id,
          value: data?.printer?.device_name,
        },
        size: {
          key: data?.printer?.printerSize,
          value: data?.printer?.printerType === "usb" ? "3 Inch" : "2 Inch",
        },
        printerWidthMM: {
          key: data?.printer?.printerWidthMM || "",
          value:
            data?.printer?.printerWidthMM === "other"
              ? "Other"
              : data?.printer?.printerWidthMM || "",
        },
        otherPrinterWidth:
          data?.printer?.printerWidthMM === "other"
            ? data?.printer?.printerWidthMM || ""
            : "",
        charsPerLine: {
          key: data?.printer?.charsPerLine || "",
          value:
            data?.printer?.charsPerLine === "other"
              ? "Other"
              : data?.printer?.charsPerLine || "",
        },
        otherCharsLine:
          data?.printer?.charsPerLine === "other"
            ? data?.printer?.charsPerLine || ""
            : "",
        kitchen: {
          key: data?.printer?.kitchenRef,
          value: data?.printer?.kitchen?.name,
        },
      });
      setSelectedPrinter(data?.printer);
    }
  }, [data]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent={false}
      style={{ height: "100%" }}
    >
      <View
        style={{
          ...styles.container,
          backgroundColor: theme.colors.transparentBg,
        }}
      >
        <View
          style={{
            ...styles.container,
            marginHorizontal: twoPaneView ? "20%" : "0%",
            backgroundColor: theme.colors.bgColor,
          }}
        >
          <ActionSheetHeader
            title={data.isAdd ? t("Add a printer") : data.title}
            rightBtnText={
              data.isAdd ? t("Add") : !isEditing ? t("Edit") : t("Save")
            }
            handleLeftBtn={() => {
              formik.resetForm();
              handleClose();
            }}
            loading={formik.isSubmitting}
            handleRightBtn={() => {
              if (isEditing) {
                formik.handleSubmit();
              } else {
                setIsEditing(true);
              }
            }}
            permission={
              data?.printer?._id
                ? authContext.permission["pos:printer"]?.update
                : authContext.permission["pos:printer"]?.create
            }
          />

          <KeyboardAvoidingView
            enabled={true}
            behavior={"height"}
            keyboardVerticalOffset={Platform.OS == "ios" ? 50 : 20}
          >
            <ScrollView
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingVertical: hp("3%"),
                paddingHorizontal: hp("2.5%"),
              }}
            >
              <Input
                style={{ width: "100%" }}
                label={t("PRINTER NAME")}
                autoCapitalize="words"
                maxLength={60}
                placeholderText={`${t("Ex")}. ${t("Billing printer")}`}
                values={formik.values.name}
                handleChange={(val: any) => formik.setFieldValue("name", val)}
                disabled={!isEditing}
              />
              <ErrorText
                errors={(formik.errors.name && formik.touched.name) as Boolean}
                title={formik.errors.name || ""}
              />

              <Spacer space={hp("4%")} />

              <View
                style={{
                  marginLeft: hp("1.75%"),
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center" }}
                  onPress={() => {
                    formik.setFieldValue("type", "usb");
                    formik.setFieldValue("modal", { value: "", key: "" });
                    formik.setFieldValue("size", {
                      value: "3 Inch",
                      key: "3-inch",
                    });
                  }}
                  disabled={!isEditing || !data.isAdd}
                >
                  <Checkbox
                    isChecked={formik.values.type == "usb"}
                    fillColor={theme.colors.white[1000]}
                    unfillColor={theme.colors.white[1000]}
                    iconComponent={
                      formik.values.type == "usb" ? (
                        <ICONS.RadioFilledIcon
                          color={theme.colors.primary[1000]}
                        />
                      ) : (
                        <ICONS.RadioEmptyIcon
                          color={theme.colors.primary[1000]}
                        />
                      )
                    }
                    disableBuiltInState
                    disabled
                  />

                  <DefaultText fontSize="xl">{t("USB")}</DefaultText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    marginLeft: hp("4%"),
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                  onPress={() => {
                    formik.setFieldValue("type", "inbuilt");
                    formik.setFieldValue("modal", { value: "", key: "" });
                    formik.setFieldValue("size", {
                      value: "2 Inch",
                      key: "2-inch",
                    });
                  }}
                  disabled={!isEditing || !data.isAdd}
                >
                  <Checkbox
                    isChecked={formik.values.type == "inbuilt"}
                    fillColor={theme.colors.white[1000]}
                    unfillColor={theme.colors.white[1000]}
                    iconComponent={
                      formik.values.type == "inbuilt" ? (
                        <ICONS.RadioFilledIcon
                          color={theme.colors.primary[1000]}
                        />
                      ) : (
                        <ICONS.RadioEmptyIcon
                          color={theme.colors.primary[1000]}
                        />
                      )
                    }
                    disableBuiltInState
                    disabled
                  />

                  <DefaultText fontSize="xl">{t("Inbuilt")}</DefaultText>
                </TouchableOpacity>
              </View>

              <Spacer space={hp("3%")} />

              <Label>{t("PRINTER & SIZE")}</Label>

              <View>
                <SelectInput
                  containerStyle={{
                    borderWidth: 0,
                    borderRadius: 0,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                  }}
                  isTwoText={true}
                  label={""}
                  leftText={`${t("Select printer")} *`}
                  allowSearch={false}
                  placeholderText={t("Select printer")}
                  options={
                    formik.values.type === "inbuilt"
                      ? inbuiltPrinterOption
                      : printers.map((p: any) => {
                          return {
                            key: p?.device_id,
                            value: `${"Product Id"}: ${p?.product_id}, (${
                              p?.device_name
                            })`,
                          };
                        })
                  }
                  values={formik.values.modal}
                  handleChange={async (val: any) => {
                    if (val.key && val.value) {
                      if (formik.values.type === "inbuilt") {
                        formik.setFieldValue("modal", val);
                        return;
                      }

                      const printerDevice = printers.find(
                        (p: any) => p.device_id === val.key
                      );

                      await printerRepository.connect({
                        product_id: printerDevice.product_id,
                      });

                      debugLog(
                        "Selected printer",
                        printerDevice,
                        "setting-printer-screen",
                        "handleSelectPrinter"
                      );

                      setSelectedPrinter(printerDevice);
                      formik.setFieldValue("modal", val);
                    }
                  }}
                  disabled={!isEditing || !data.isAdd}
                />
                <ErrorText
                  errors={
                    (formik.errors.modal?.value &&
                      formik.touched.modal?.value) as Boolean
                  }
                  title={formik.errors.modal?.value || ""}
                />

                <View
                  style={{
                    marginLeft: 16,
                    borderBottomWidth: 0.5,
                    borderColor: theme.colors.dividerColor.main,
                  }}
                />

                <SelectInput
                  containerStyle={{
                    borderWidth: 0,
                    borderRadius: 0,
                    borderBottomLeftRadius:
                      formik.values.type === "usb" ? 0 : 16,
                    borderBottomRightRadius:
                      formik.values.type === "usb" ? 0 : 16,
                  }}
                  isTwoText={true}
                  label={""}
                  leftText={t("Printer Size")}
                  allowSearch={false}
                  placeholderText={t("Select printer size")}
                  options={
                    formik.values.type === "usb"
                      ? usbSizeOptions
                      : inbuiltSizeOptions
                  }
                  values={formik.values.size}
                  handleChange={(val: any) => {
                    formik.setFieldValue("size", val);
                  }}
                  disabled={!isEditing || !data.isAdd}
                />

                {formik.values.type === "usb" && (
                  <>
                    <View
                      style={{
                        marginLeft: 16,
                        borderBottomWidth: 1,
                        borderColor: theme.colors.dividerColor.main,
                      }}
                    />

                    <SelectInput
                      containerStyle={{
                        borderWidth: 0,
                        borderRadius: 0,
                      }}
                      isTwoText={true}
                      label={""}
                      leftTextWithInfo={true}
                      infoMsg={t("info_printer_width")}
                      leftText={t("Printer width in MM")}
                      allowSearch={false}
                      placeholderText={t("Select printer width")}
                      options={printerWidthMMOptions}
                      values={formik.values.printerWidthMM}
                      handleChange={(val: any) => {
                        formik.setFieldValue("printerWidthMM", val);
                      }}
                      disabled={!isEditing}
                    />

                    {formik.values.printerWidthMM.key === "other" && (
                      <>
                        <View
                          style={{
                            marginLeft: 16,
                            borderBottomWidth: 1,
                            borderColor: theme.colors.dividerColor.main,
                          }}
                        />

                        <View
                          style={{
                            paddingHorizontal: 16,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: theme.colors.white[1000],
                          }}
                        >
                          <DefaultText fontWeight="normal">
                            {`${t("Other printer width in MM")} *`}
                          </DefaultText>

                          <Input
                            containerStyle={{
                              flex: 1,
                              borderWidth: 0,
                              borderRadius: 0,
                            }}
                            style={{ width: "100%", textAlign: "right" }}
                            placeholderText={t("Enter printer width")}
                            values={formik.values.otherPrinterWidth}
                            keyboardType={"number-pad"}
                            handleChange={(val: any) => {
                              if (val == "" || val?.length <= 2) {
                                formik.setFieldValue(
                                  "otherPrinterWidth",
                                  val?.replace(/[^0-9]/, "")
                                );
                              }
                            }}
                            disabled={!isEditing}
                          />
                        </View>
                      </>
                    )}

                    <View
                      style={{
                        marginLeft: 16,
                        borderBottomWidth: 0.5,
                        borderColor: theme.colors.dividerColor.main,
                      }}
                    />

                    <SelectInput
                      containerStyle={{
                        borderWidth: 0,
                        borderRadius: 0,
                        borderBottomLeftRadius:
                          formik.values.charsPerLine.key === "other" ? 0 : 16,
                        borderBottomRightRadius:
                          formik.values.charsPerLine.key === "other" ? 0 : 16,
                      }}
                      isTwoText={true}
                      label={""}
                      leftTextWithInfo={true}
                      infoMsg={t("info_print_characters_per_line")}
                      leftText={t("Print characters per line")}
                      allowSearch={false}
                      placeholderText={t("Select print characters per line")}
                      options={charsPerLineOptions}
                      values={formik.values.charsPerLine}
                      handleChange={(val: any) => {
                        formik.setFieldValue("charsPerLine", val);
                      }}
                      disabled={!isEditing}
                    />

                    {formik.values.charsPerLine.key === "other" && (
                      <>
                        <View
                          style={{
                            marginLeft: 16,
                            borderBottomWidth: 0.5,
                            borderColor: theme.colors.dividerColor.main,
                          }}
                        />

                        <View
                          style={{
                            paddingHorizontal: 16,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderBottomLeftRadius: 16,
                            borderBottomRightRadius: 16,
                            backgroundColor: theme.colors.white[1000],
                          }}
                        >
                          <DefaultText fontWeight="normal">
                            {`${t("Other print chars per line")} *`}
                          </DefaultText>

                          <Input
                            containerStyle={{
                              flex: 1,
                              borderWidth: 0,
                              borderRadius: 0,
                            }}
                            style={{ width: "100%", textAlign: "right" }}
                            placeholderText={t("Enter print chars per line")}
                            values={formik.values.otherCharsLine}
                            keyboardType={"number-pad"}
                            handleChange={(val: any) => {
                              if (val == "" || val?.length <= 2) {
                                formik.setFieldValue(
                                  "otherCharsLine",
                                  val?.replace(/[^0-9]/, "")
                                );
                              }
                            }}
                            disabled={!isEditing}
                          />
                        </View>
                      </>
                    )}
                  </>
                )}
              </View>

              <Spacer space={hp("3.75%")} />

              <Label>{t("USE THIS PRINTER FOR")}</Label>

              <View
                style={{
                  borderRadius: 16,
                  backgroundColor: theme.colors.white[1000],
                }}
              >
                <View style={styles.content_view}>
                  <DefaultText>{t("Receipts")}</DefaultText>

                  <Switch
                    style={{
                      marginRight: 6,
                      opacity: isEditing ? 1 : 0.5,
                      transform:
                        Platform.OS == "ios"
                          ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                          : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
                      height: hp("5%"),
                    }}
                    trackColor={{
                      false: "rgba(120, 120, 128, 0.16)",
                      true: "#34C759",
                    }}
                    thumbColor={theme.colors.white[1000]}
                    onValueChange={(val: any) => {
                      if (val != null) {
                        formik.setFieldValue("receipts", val);
                      }
                    }}
                    value={formik.values.receipts}
                    disabled={!isEditing}
                  />
                </View>

                <View
                  style={{
                    marginLeft: 16,
                    borderBottomWidth: 0.5,
                    borderColor: theme.colors.dividerColor.main,
                  }}
                />

                {businessData?.company?.industry?.toLowerCase() ===
                  "restaurant" && (
                  <View>
                    <View style={styles.content_view}>
                      <DefaultText>{t("KOT")}</DefaultText>

                      <Switch
                        style={{
                          marginRight: 6,
                          opacity: isEditing ? 1 : 0.5,
                          transform:
                            Platform.OS == "ios"
                              ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                              : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
                          height: hp("5%"),
                        }}
                        trackColor={{
                          false: "rgba(120, 120, 128, 0.16)",
                          true: "#34C759",
                        }}
                        thumbColor={theme.colors.white[1000]}
                        onValueChange={(val: any) => {
                          if (val != null) {
                            formik.setFieldValue("kot", val);
                          }
                        }}
                        value={formik.values.kot}
                        disabled={!isEditing}
                      />
                    </View>

                    <View
                      style={{
                        marginLeft: 16,
                        borderBottomWidth: 0.5,
                        borderColor: theme.colors.dividerColor.main,
                      }}
                    />
                  </View>
                )}

                <View style={styles.content_view}>
                  <DefaultText>{t("Barcodes")}</DefaultText>

                  <Switch
                    style={{
                      marginRight: 6,
                      opacity: isEditing ? 1 : 0.5,
                      transform:
                        Platform.OS == "ios"
                          ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                          : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
                      height: hp("5%"),
                    }}
                    trackColor={{
                      false: "rgba(120, 120, 128, 0.16)",
                      true: "#34C759",
                    }}
                    thumbColor={theme.colors.white[1000]}
                    onValueChange={(val: any) => {
                      if (val != null) {
                        formik.setFieldValue("barcodes", val);
                      }
                    }}
                    value={formik.values.barcodes}
                    disabled={!isEditing}
                  />
                </View>
              </View>

              <Spacer space={hp("5%")} />

              {businessData?.company?.industry?.toLowerCase() ===
                "restaurant" &&
                businessData?.company?.enableKitchenManagement &&
                formik.values.kot && (
                  <View>
                    <Label>{`${t("KITCHEN")} *`}</Label>

                    <TouchableOpacity
                      style={{
                        ...styles.drop_down_view,
                        height: hp("7.5%"),
                        borderRadius: 16,
                        opacity: data.isAdd ? 1 : 0.5,
                        backgroundColor: theme.colors.white[1000],
                      }}
                      onPress={() => {
                        if (isEditing) {
                          kitchenSelectInputRef.current.open();
                        }
                      }}
                      disabled={!data.isAdd}
                    >
                      <DefaultText
                        fontWeight="normal"
                        color={
                          !data.isAdd || formik.values.kitchen.key
                            ? theme.colors.otherGrey[100]
                            : theme.colors.placeholder
                        }
                      >
                        {formik.values.kitchen.key
                          ? formik.values.kitchen.value
                          : t("Select Kitchen")}
                      </DefaultText>

                      <View
                        style={{
                          transform: [{ rotate: isRTL ? "180deg" : "0deg" }],
                        }}
                      >
                        <ICONS.RightContentIcon />
                      </View>
                    </TouchableOpacity>
                  </View>
                )}

              <Spacer space={hp("6.5%")} />

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {!data?.isAdd &&
                  formik.values.type === "usb" &&
                  selectedPrinter?.enableReceipts && (
                    <PrimaryButton
                      reverse
                      style={{
                        width:
                          businessData?.company?.industry?.toLowerCase() ===
                            "restaurant" && selectedPrinter?.enableKOT
                            ? "49%"
                            : "100%",
                      }}
                      textStyle={{
                        fontSize: 20,
                        fontWeight: theme.fontWeights.medium,
                        fontFamily: theme.fonts.circulatStd,
                        color: theme.colors.primary[1000],
                      }}
                      title={t("Test Print")}
                      onPress={async () => {
                        ExpoPrintHelp.initialize();

                        const connetedDevice = await ExpoPrintHelp.connect(
                          selectedPrinter?.product_id
                        );

                        if (selectedPrinter?.device_name && connetedDevice) {
                          try {
                            handleTestPrint(selectedPrinter);
                          } catch (err: any) {
                            errorLog(
                              err?.message,
                              {},
                              "setting-printer-screen",
                              "handleTestPrint",
                              err
                            );
                          }
                        } else {
                          showToast("error", t("Printer not connected"));
                        }
                      }}
                      disabled={
                        data?.isAdd &&
                        Object.keys(selectedPrinter || {}).length === 0
                      }
                    />
                  )}

                {!data?.isAdd &&
                  businessData?.company?.industry?.toLowerCase() ===
                    "restaurant" &&
                  formik.values.type === "usb" &&
                  selectedPrinter?.enableKOT && (
                    <PrimaryButton
                      reverse
                      style={{ width: "49%" }}
                      textStyle={{
                        fontSize: 20,
                        fontWeight: theme.fontWeights.medium,
                        fontFamily: theme.fonts.circulatStd,
                        color: theme.colors.primary[1000],
                      }}
                      title={t("Test KOT")}
                      onPress={async () => {
                        ExpoPrintHelp.initialize();

                        const connetedDevice = await ExpoPrintHelp.connect(
                          selectedPrinter?.product_id
                        );

                        if (selectedPrinter?.device_name && connetedDevice) {
                          try {
                            handleTestKOT(selectedPrinter);
                          } catch (err: any) {
                            errorLog(
                              err?.message,
                              {},
                              "setting-printer-screen",
                              "handleTestPrint",
                              err
                            );
                          }
                        } else {
                          showToast("error", t("Printer not connected"));
                        }
                      }}
                      disabled={
                        data?.isAdd &&
                        Object.keys(selectedPrinter || {}).length === 0
                      }
                    />
                  )}
              </View>

              {!data.isAdd && isEditing && (
                <TouchableOpacity
                  style={{ marginTop: hp("2%") }}
                  onPress={async () => {
                    const entity: any = await repo.printer.findOne({
                      where: { _id: data?.printer?._id },
                    });
                    await repo.printer.remove(entity).then(async (r) => {
                      EventRegister.emit("print-changed", {
                        enableReceipts: entity.enableReceipts,
                        enableKOT: entity.enableKOT,
                      });

                      if (
                        businessData?.company?.industry?.toLowerCase() ===
                          "restaurant" &&
                        businessData?.company?.enableKitchenManagement &&
                        formik.values.kot &&
                        formik.values.kitchen.key
                      ) {
                        const kitchenData =
                          await repo.kitchenManagement.findOne({
                            where: { _id: formik.values.kitchen.key },
                          });

                        if (kitchenData?._id) {
                          await repo.kitchenManagement.update(
                            { _id: kitchenData._id },
                            {
                              ...kitchenData,
                              source: "local",
                              printerName: "",
                              printerAssigned: false,
                              deviceRef: "",
                              device: { deviceCode: "" },
                            }
                          );
                        }
                      }

                      handleClose();
                    });
                    debugLog(
                      "Printer removed from db",
                      entity,
                      "setting-printer-screen",
                      "handleRemoveFunction"
                    );
                    await queryClient.invalidateQueries("find-printers");
                  }}
                  disabled={!authContext.permission["pos:printer"]?.delete}
                >
                  <DefaultText
                    fontSize="3xl"
                    fontWeight="normal"
                    color={
                      authContext.permission["pos:printer"]?.delete
                        ? "red.default"
                        : "otherGrey.200"
                    }
                  >
                    {t("Remove")}
                  </DefaultText>
                </TouchableOpacity>
              )}

              <Spacer space={hp("12%")} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>

      <Toast />

      <KitchenSelectInput
        data={formik.values.kitchen}
        sheetRef={kitchenSelectInputRef}
        handleSelected={(val: any) => {
          if (val?.key && val?.value) {
            formik.setFieldValue("formChanged", true);
            formik.setFieldValue("kitchen", val);
            kitchenSelectInputRef.current.close();
          }
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
  content_view: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  drop_down_view: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
});
