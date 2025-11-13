import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  SvgIcon,
  Box,
  Divider,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import { t } from "i18next";

// Maintaining two tiers with updated feature information
const billingData = [
  {
    "Software Features": {
      en: "POS Billing",
      ar: "فاتورة نقاط البيع",
    },
    Startup: true,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Multiple Payment types",
      ar: "أنواع دفع متعددة",
    },
    Startup: true,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Dynamic Order Types",
      ar: "أنواع طلبات ديناميكية",
    },
    Startup: true,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Refunds",
      ar: "استردادات",
    },
    Startup: true,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Shift / Cash Management",
      ar: "إدارة الورديات / النقدية",
    },
    Startup: true,
    Advance: true,
  },
];

const catalogueData = [
  {
    "Software Features": {
      en: "Single & Multivariant Products",
      ar: "منتجات أحادية ومتعددة المتغيرات",
    },
    Startup: true,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Categories",
      ar: "فئات",
    },
    Startup: true,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Location level prices",
      ar: "أسعار على مستوى الموقع",
    },
    Startup: false,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Bulk Price adjustments",
      ar: "تعديلات الأسعار بالجملة",
    },
    Startup: true,
    Advance: true,
  },
];

const advancedCatalogueData = [
  {
    "Software Features": {
      en: "Composite Products",
      ar: "منتجات مركبة",
    },
    Startup: { value: "Ad-on", isAddon: true },
    Advance: true,
  },
  {
    "Software Features": {
      en: "Boxes & Crates",
      ar: "صناديق وأقفاص",
    },
    Startup: { value: "Ad-on", isAddon: true },
    Advance: true,
  },
  {
    "Software Features": {
      en: "Custom Charges",
      ar: "رسوم مخصصة",
    },
    Startup: { value: "Ad-on", isAddon: true },
    Advance: true,
  },
  {
    "Software Features": {
      en: "Modifiers",
      ar: "معدلات",
    },
    Startup: { value: "Ad-on", isAddon: true },
    Advance: true,
  },
];

const stockAndInventoryData = [
  {
    "Software Features": {
      en: "Vendor Management",
      ar: "إدارة الموردين",
    },
    Startup: false,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Saleable and non-saleable inventory",
      ar: "المخزون القابل للبيع وغير القابل للبيع",
    },
    Startup: false,
    Advance: true,
  },
  {
    "Software Features": {
      en: "PO & GRN",
      ar: "أمر الشراء ومذكرة استلام البضائع",
    },
    Startup: false,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Stocktake (Stock Counting)*",
      ar: "جرد المخزون*",
    },
    Startup: false,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Internal transfers",
      ar: "التحويلات الداخلية",
    },
    Startup: false,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Centralized production & distribution",
      ar: "الإنتاج والتوزيع المركزي",
    },
    Startup: false,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Stock Batch Management",
      ar: "إدارة دفعات المخزون",
    },
    Startup: false,
    Advance: true,
  },
];

const accountingData = [
  {
    "Software Features": {
      en: "Basic accounting",
      ar: "المحاسبة الأساسية",
    },
    Startup: { value: "Ad-on", isAddon: true },
    Advance: true,
  },
  {
    "Software Features": {
      en: "Expenses and sales tracking",
      ar: "تتبع المصروفات والمبيعات",
    },
    Startup: { value: "Ad-on", isAddon: true },
    Advance: true,
  },
];

const menuAndPriceData = [
  {
    "Software Features": {
      en: "Order type based menu and prices",
      ar: "قائمة وأسعار حسب نوع الطلب",
    },
    Startup: true,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Advanced menu - Variants & Modifiers",
      ar: "قائمة متقدمة - متغيرات ومعدلات",
    },
    Startup: true,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Scheduled menu changes*",
      ar: "تغييرات القائمة المجدولة*",
    },
    Startup: false,
    Advance: true,
  },
];

const kitchenAndTablesData = [
  {
    "Software Features": {
      en: "Tables Management",
      ar: "إدارة الطاولات",
    },
    Startup: false,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Courses",
      ar: "الدورات",
    },
    Startup: false,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Kitchen Management & routing",
      ar: "إدارة المطبخ والتوجيه",
    },
    Startup: false,
    Advance: true,
  },
];

const promotionsData = [
  {
    "Software Features": {
      en: "Basic - Amount & Percentage based discounts",
      ar: "الأساسية - خصومات مبنية على المبلغ والنسبة المئوية",
    },
    Startup: true,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Advanced promotions",
      ar: "عروض ترويجية متقدمة",
    },
    Startup: { value: "Ad-on", isAddon: true },
    Advance: true,
  },
];

const orderingData = [
  {
    "Software Features": {
      en: "Online & Self Ordering",
      ar: "الطلب عبر الإنترنت والطلب الذاتي",
    },
    Startup: { value: "Ad-on", isAddon: true },
    Advance: true,
  },
  {
    "Software Features": {
      en: "QR Based Ordering",
      ar: "الطلب بناءً على رمز الاستجابة السريعة",
    },
    Startup: { value: "Ad-on", isAddon: true },
    Advance: true,
  },
];

const reportsData = [
  {
    "Software Features": {
      en: "Business Reports",
      ar: "تقارير الأعمال",
    },
    Startup: true,
    Advance: true,
  },
  {
    "Software Features": {
      en: "P&L Report",
      ar: "تقرير الربح والخسارة",
    },
    Startup: true,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Inventory reports",
      ar: "تقارير المخزون",
    },
    Startup: true,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Stock Alerts",
      ar: "تنبيهات المخزون",
    },
    Startup: false,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Actionable Customer insights*",
      ar: "رؤى العملاء القابلة للتنفيذ*",
    },
    Startup: false,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Actionable Business insights*",
      ar: "رؤى الأعمال القابلة للتنفيذ*",
    },
    Startup: false,
    Advance: true,
  },
];

const notificationData = [
  {
    "Software Features": {
      en: "Automated Push notifications",
      ar: "إشعارات الدفع التلقائيّة",
    },
    Startup: true,
    Advance: true,
  },
];

const customersData = [
  {
    "Software Features": {
      en: "Customers Management",
      ar: "إدارة العملاء",
    },
    Startup: true,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Customer Credit Management",
      ar: "إدارة ائتمان العملاء",
    },
    Startup: true,
    Advance: true,
  },
];

const loyaltyData = [
  {
    "Software Features": {
      en: "Loyalty Program",
      ar: "برنامج الولاء",
    },
    Startup: false,
    Advance: true,
  },
];

const otherData = [
  {
    "Software Features": {
      en: "ZATCA Phase 1 & 2 integration",
      ar: "تكامل ZATCA المرحلة 1 و 2",
    },
    Startup: true,
    Advance: true,
  },
  {
    "Software Features": {
      en: "STC QR Payments*",
      ar: "مدفوعات QR من STC*",
    },
    Startup: true,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Payment through NeoLeap POS*",
      ar: "الدفع عبر NeoLeap POS*",
    },
    Startup: true,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Multi-user login",
      ar: "تسجيل الدخول متعدد المستخدمين",
    },
    Startup: true,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Permissions based access",
      ar: "الوصول على أساس الأذونات",
    },
    Startup: true,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Offline support",
      ar: "الدعم دون اتصال بالإنترنت",
    },
    Startup: true,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Multi-lingual (English, Arabic & Urdu)",
      ar: "متعدد اللغات (الإنجليزية، العربية، والأردية)",
    },
    Startup: true,
    Advance: true,
  },
  {
    "Software Features": {
      en: "Multi-locations",
      ar: "مواقع متعددة",
    },
    Startup: true,
    Advance: true,
  },
];

const addonsData = [
  {
    name: {
      en: "Self Ordering - Online & QR Based",
      ar: "الطلب الذاتي - عبر الإنترنت وعلى أساس رمز الاستجابة السريعة",
    },
    quarterly: "SAR 150",
    annually: "SAR 150",
  },
  {
    name: {
      en: "Offers and Promotions***",
      ar: "العروض والترويجات***",
    },
    quarterly: "SAR 100",
    annually: "SAR 100",
  },
  {
    name: {
      en: "Advanced Catalogue",
      ar: "كتالوج متقدم",
    },
    quarterly: "SAR 50",
    annually: "SAR 50",
  },
  {
    name: {
      en: "Customer display Ads",
      ar: "إعلانات عرض العملاء",
    },
    quarterly: "SAR 100",
    annually: "SAR 100",
  },
  {
    name: {
      en: "API Consultation for third party Integrations",
      ar: "استشارة API لتكاملات الطرف الثالث",
    },
    quarterly: "SAR 3000",
    annually: "SAR 3000",
  },
];

const footerNotes = [
  {
    en: "* Launching Soon",
    ar: "* يتم الإطلاق قريبًا",
  },
  {
    en: "** Table and course-based billing isn't available on handheld/mobile devices currently",
    ar: "** فوترة الطاولة والدورة غير متوفرة حاليًا على الأجهزة المحمولة/المحمولة",
  },
  {
    en: "*** Currently available for quick billing and online ordering only. Launching soon for tables",
    ar: "*** متاحة حاليًا للفوترة السريعة والطلب عبر الإنترنت فقط. سيتم إطلاقها قريبًا للطاولات",
  },
  {
    en: "Note: Tijarah360 does not provide ingredients and recipe mapping. Supports item-level inventory only",
    ar: "ملاحظة: لا يوفر Tijarah360 المكونات وتخطيط الوصفات. يدعم مخزون المستوى الفردي فقط",
  },
];

const renderCellContent = (value: any) => {
  if (value === true) {
    return (
      <SvgIcon fontSize="small" sx={{ color: "green" }}>
        <CheckIcon />
      </SvgIcon>
    );
  } else if (value === false) {
    return (
      <SvgIcon fontSize="small" sx={{ color: "red" }}>
        <ClearIcon />
      </SvgIcon>
    );
  } else if (value && typeof value === "object" && value.isAddon) {
    return (
      <Typography variant="body2" color="text.secondary">
        {value.value}
      </Typography>
    );
  } else {
    return value;
  }
};

export default function PricingTable() {
  const lng = localStorage.getItem("currentLanguage") || "en";

  const renderTableSection = (title: any, dataArray: any) => (
    <>
      <TableRow>
        <TableCell>
          <Typography variant="h6">{t(title)}</Typography>
        </TableCell>
        <TableCell></TableCell>
        <TableCell></TableCell>
      </TableRow>
      {dataArray.map((row: any, index: number) => (
        <TableRow key={index}>
          <TableCell component="th" scope="row">
            {lng === "ar"
              ? row["Software Features"].ar
              : row["Software Features"].en}
          </TableCell>
          <TableCell align="center">{renderCellContent(row.Startup)}</TableCell>
          <TableCell align="center">{renderCellContent(row.Advance)}</TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <>
      <TableContainer component={Paper} sx={{ width: "100%", mb: 4 }}>
        <Table aria-label="pricing table">
          <TableHead>
            <TableRow>
              <TableCell style={{ fontSize: "14px", fontWeight: "bold" }}>
                {t("Software Features")}
              </TableCell>
              <TableCell
                style={{ fontSize: "14px", fontWeight: "bold" }}
                align="center"
              >
                {t("Startup")}
              </TableCell>
              <TableCell
                style={{ fontSize: "14px", fontWeight: "bold" }}
                align="center"
              >
                {t("Advanced")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {renderTableSection("Billing", billingData)}
            {renderTableSection("Catalogue", catalogueData)}
            {renderTableSection("Advanced Catalogue", advancedCatalogueData)}
            {renderTableSection("Stock & Inventory", stockAndInventoryData)}
            {renderTableSection("Accounting", accountingData)}
            {renderTableSection("Menu & Price Management", menuAndPriceData)}
            {renderTableSection("Kitchen & Tables", kitchenAndTablesData)}
            {renderTableSection("Promotions & Discounts", promotionsData)}
            {renderTableSection("Online Ordering", orderingData)}
            {renderTableSection("Reports & Insights", reportsData)}
            {renderTableSection("Notifications", notificationData)}
            {renderTableSection("Customers", customersData)}
            {renderTableSection("Loyalty", loyaltyData)}
            {renderTableSection("Others", otherData)}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t("Notes")}
        </Typography>
        {footerNotes.map((note, index) => (
          <Typography key={index} variant="body2" gutterBottom>
            {lng === "ar" ? note.ar : note.en}
          </Typography>
        ))}
      </Box>
    </>
  );
}
