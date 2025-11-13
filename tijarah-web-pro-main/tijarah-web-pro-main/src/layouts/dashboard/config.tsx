import {
  CollectionsTwoTone,
  CurrencyExchangeSharp,
  DiscountTwoTone,
  LoyaltyOutlined,
  Menu,
  AccountBalanceWallet,
} from "@mui/icons-material";
import AccountBalanceWalletTwoToneIcon from "@mui/icons-material/AccountBalanceWalletTwoTone";
import AppSettingsAltTwoToneIcon from "@mui/icons-material/AppSettingsAltTwoTone";
import AutoAwesomeMosaicTwoToneIcon from "@mui/icons-material/AutoAwesomeMosaicTwoTone";
import BackupTableIcon from "@mui/icons-material/BackupTable";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import CategoryTwoToneIcon from "@mui/icons-material/CategoryTwoTone";
import DevicesIcon from "@mui/icons-material/Devices";
import FeaturedVideoIcon from "@mui/icons-material/FeaturedVideo";
import FmdGoodTwoToneIcon from "@mui/icons-material/FmdGoodTwoTone";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ManageHistoryIcon from "@mui/icons-material/ManageHistory";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ReceiptLongTwoToneIcon from "@mui/icons-material/ReceiptLongTwoTone";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { SvgIcon } from "@mui/material";
import User03Icon from "@untitled-ui/icons-react/build/esm/User03";
import { t } from "i18next";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { useUserType } from "src/hooks/use-user-type";
import BarChartSquare02Icon from "src/icons/untitled-ui/duocolor/bar-chart-square-02";
import Building04Icon from "src/icons/untitled-ui/duocolor/building-04";
import HomeSmileIcon from "src/icons/untitled-ui/duocolor/home-smile";
import LineChartUp04Icon from "src/icons/untitled-ui/duocolor/line-chart-up-04";
import ShoppingBag03Icon from "src/icons/untitled-ui/duocolor/shopping-bag-03";
import Users03Icon from "src/icons/untitled-ui/duocolor/users-03";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { USER_TYPES } from "src/utils/constants";

export interface Item {
  disabled?: boolean;
  external?: boolean;
  icon?: ReactNode;
  items?: Item[];
  label?: ReactNode;
  path?: string;
  title: string;
  subPath?: string;
  childPath?: string[];
  tag?: string;
}

export interface Section {
  items: Item[];
  subheader?: string;
}

const superAdminSidebar = [
  {
    items: [
      {
        title: t("Dashboard"),
        path: tijarahPaths.dashboard,
        icon: (
          <SvgIcon fontSize="small">
            <HomeSmileIcon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["dashboard:read"]],
        featureModule: "Dashboard",
        childPath: [
          tijarahPaths.dashboard.salesDashboard,
          tijarahPaths.dashboard.inventoryDashboard,
          // tijarahPaths.dashboard.otherDashboard,
        ],
        items: [
          {
            title: t("Sales"),
            path: tijarahPaths.dashboard.salesDashboard,
            permissions: [MoleculeType["dashboard:read"]],
            featureModule: "Sales",
          },
          // {
          //   title: t("Hourly Report"),
          //   path: tijarahPaths.dashboard.hourlyDashboard,
          //   permissions: [MoleculeType["dashboard:read"]],
          //   featureModule: "Hourly Report",
          // },
          // {
          //   title: t("Inventory"),
          //   path: tijarahPaths.dashboard.inventoryDashboard,
          //   permissions: [MoleculeType["dashboard:read"]],
          //   featureModule: "Inventory",
          // },
          // {
          //   title: t("Others"),
          //   path: tijarahPaths.dashboard.otherDashboard,
          // },
        ],
      },
      {
        title: t("Reports"),
        path: tijarahPaths.platform.reports,
        icon: (
          <SvgIcon fontSize="small">
            <BarChartSquare02Icon />
          </SvgIcon>
        ),
        permissions: [
          MoleculeType["report:companies:read"],
          MoleculeType["report:categories:read"],
          // MoleculeType["report:product:read"],
          MoleculeType["report:shift-and-cash-drawer:read"],
          MoleculeType["report:payment-method:read"],
          MoleculeType["report:sales:read"],
          // MoleculeType["report:inventory-by-location:read"],
          MoleculeType["report:inventory:read"],
          MoleculeType["report:vat:read"],
          MoleculeType["report:sales-summary:read"],
          MoleculeType["report:ads:read"],
          MoleculeType["report:variant:read"],
          MoleculeType["report:inventory-change:read"],
        ],
        featureModule: "Report",
        childPath: [
          tijarahPaths.platform.reports.companies,
          tijarahPaths.reports.categoriesReport,
          // tijarahPaths.reports.productsReport,
          tijarahPaths.reports.shiftsAndCashDrawerReport,
          tijarahPaths.reports.paymentMethodReport,
          tijarahPaths.reports.salesReport,
          // tijarahPaths.reports.newSalesReport,
          tijarahPaths.reports.salesSummaryReport,
          tijarahPaths.reports.variantReport,
          // tijarahPaths.reports.performanceReport,
          tijarahPaths.reports.inventoryChangeReport,
          tijarahPaths.reports.lowInventoryReport,
          tijarahPaths.reports.deadInventoryReport,
          // tijarahPaths.reports.inventoryByLocationReport,
          tijarahPaths.reports.expiringInventory,
          tijarahPaths.reports.inventoryReport,
          tijarahPaths.reports.vatReport,
          tijarahPaths.reports.customChargeVatReport,
          tijarahPaths.reports.adsReport,
          tijarahPaths.reports.void,
          tijarahPaths.reports.comp,
          tijarahPaths.reports.productReportOrderWise,
        ],
        items: [
          {
            title: t("Companies"),
            path: tijarahPaths.platform.reports.companies,
            permissions: [MoleculeType["report:companies:read"]],
            featureModule: "Companies",
          },
          {
            title: t("Categories"),
            path: tijarahPaths.reports.categoriesReport,
            permissions: [MoleculeType["report:categories:read"]],
            featureModule: "Categories",
          },
          // {
          //   title: t("Products"),
          //   path: tijarahPaths.reports.productsReport,
          //   permissions: [MoleculeType["report:product:read"]],
          // },
          {
            title: t("Shifts and Cash Drawer"),
            path: tijarahPaths.reports.shiftsAndCashDrawerReport,
            permissions: [MoleculeType["report:shift-and-cash-drawer:read"]],
            featureModule: "Shifts and Cash Drawer",
          },
          // {
          //   title: t("Sales Report"),
          //   path: tijarahPaths.reports.newSalesReport,
          //   permissions: [MoleculeType["report:shift-and-cash-drawer:read"]],
          //   featureModule: "Sales Report",
          // },

          {
            title: t("Payment Method"),
            path: tijarahPaths.reports.paymentMethodReport,
            permissions: [MoleculeType["report:payment-method:read"]],
            featureModule: "Payment Method",
          },
          {
            title: t("Orders"),
            path: tijarahPaths.reports.salesReport,
            permissions: [MoleculeType["report:sales:read"]],
            featureModule: "Order",
          },
          // {
          //   title: t("Sales"),
          //   path: tijarahPaths.reports.newSalesReport,
          //   permissions: [MoleculeType["report:sales:read"]],
          //   featureModule: "Sales",
          // },
          {
            title: t("Inventory Change"),
            path: tijarahPaths.reports.inventoryChangeReport,
            permissions: [MoleculeType["report:inventory-change:read"]],
            featureModule: "Inventory Change",
          },
          {
            title: t("Low Inventory"),
            path: tijarahPaths?.reports.lowInventoryReport,
            featureModule: "Low Inventory",
          },
          {
            title: t("Dead Inventory"),
            path: tijarahPaths.reports.deadInventoryReport,
            featureModule: "Dead Inventory",
          },
          // {
          //   title: t("Inventory By Location"),
          //   path: tijarahPaths.reports.inventoryByLocationReport,
          //   permissions: [MoleculeType["report:inventory-by-location:read"]],
          // },
          {
            title: t("Expiring Inventory"),
            path: tijarahPaths?.reports?.expiringInventory,
            featureModule: "Expiring Inventory",
          },
          {
            title: t("Inventory"),
            path: tijarahPaths?.reports?.inventoryReport,
            permissions: [MoleculeType["report:inventory:read"]],
            featureModule: "Inventory",
          },

          {
            title: t("VAT"),
            childPath: [
              tijarahPaths.reports.vatReport,
              tijarahPaths.reports.customChargeVatReport,
            ],
            permissions: [MoleculeType["report:vat:read"]],
            featureModule: "VAT",
            items: [
              {
                title: t("Product VAT"),
                path: tijarahPaths.reports.vatReport,
                permissions: [MoleculeType["report:vat:read"]],
                featureModule: "Product VAT",
              },
              {
                title: t("Custom Charges VAT"),
                path: tijarahPaths.reports.customChargeVatReport,
                permissions: [MoleculeType["report:vat:read"]],
                featureModule: "Custom Charges VAT",
              },
            ],
          },
          // {
          //   title: t("Performance"),
          //   path: tijarahPaths?.reports.performanceReport,
          // },
          {
            title: t("Sales Summary"),
            path: tijarahPaths?.reports?.salesSummaryReport,
            permissions: [MoleculeType["report:sales-summary:read"]],
            featureModule: "Sales Summary",
          },
          {
            title: t("Products"),
            childPath: [
              tijarahPaths.reports.variantReport,
              tijarahPaths.reports.productReportOrderWise,
            ],
            permissions: [MoleculeType["report:sales:read"]],
            featureModule: "Variant/Box",
            items: [
              {
                title: t(" Product Wise"),
                path: tijarahPaths.reports.variantReport,
                permissions: [MoleculeType["report:sales:read"]],
                featureModule: "Variant/Box",
              },
              {
                title: t("Order Wise"),
                path: tijarahPaths.reports.productReportOrderWise,
                permissions: [MoleculeType["report:sales:read"]],
                featureModule: "Variant/Box",
              },
            ],
          },
          // {
          //   title: t("Ads"),
          //   path: tijarahPaths.reports.adsReport,
          //   permissions: [MoleculeType["report:ads:read"]],
          //   featureModule: "Ads",
          // },
          {
            title: t("Void"),
            path: tijarahPaths.reports.void,
            permissions: [MoleculeType["report:sales-summary:read"]],
            featureModule: "Void",
          },
          {
            title: t("Comp"),
            path: tijarahPaths.reports.comp,
            permissions: [MoleculeType["report:sales-summary:read"]],
            featureModule: "Comp",
          },
        ],
      },
      {
        title: t("Request Logs"),
        path: tijarahPaths?.platform?.logs?.posSyncReq,
        icon: (
          <SvgIcon fontSize="small">
            <ManageHistoryIcon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["sync-request:read"]],
        featureModule: "Request Logs",
      },
      {
        title: t("Audit Logs"),
        path: tijarahPaths?.platform?.auditLogs,
        icon: (
          <SvgIcon fontSize="small">
            <VerifiedUserIcon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["audit-log:read"]],
      },
      {
        title: t("Role"),
        path: tijarahPaths?.platform?.rolesAndPermission.index,
        icon: (
          <SvgIcon fontSize="small">
            <ManageAccountsIcon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["role:read"]],
        featureModule: "Role",
      },
      {
        title: t("Companies"),
        path: tijarahPaths?.platform?.companies,
        icon: (
          <SvgIcon fontSize="small">
            <Building04Icon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["company:read"]],
        featureModule: "Companies",
        childPath: [
          tijarahPaths?.management?.locations?.create,
          tijarahPaths?.catalogue?.products?.create,
          tijarahPaths?.catalogue?.categories?.create,
          tijarahPaths?.catalogue?.collections?.create,
          tijarahPaths?.catalogue?.modifiers?.create,
          tijarahPaths?.catalogue?.customCharges?.create,
          tijarahPaths?.management?.customers?.create,
          tijarahPaths?.management?.customers?.createGroup,
          tijarahPaths?.management?.discounts?.create,
          tijarahPaths?.management?.companyUsers?.create,
          tijarahPaths?.management?.devicesManagement?.devices?.create,
          tijarahPaths?.management?.locations?.users?.create,
        ],
      },
    ],
  },
  {
    subheader: t("Global Catalogue"),
    items: [
      {
        title: t("Global Products"),
        path: tijarahPaths?.platform?.globalProducts?.index,
        icon: (
          <SvgIcon fontSize="small">
            <ShoppingBag03Icon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["global-product:read"]],
        featureModule: "Global Products",
      },
      {
        title: t("Global Categories"),
        path: tijarahPaths?.platform?.globalCategories?.index,
        icon: (
          <SvgIcon fontSize="small">
            <CategoryOutlinedIcon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["global-category:read"]],
        featureModule: "Global Categories",
      },
      {
        title: t("Global  Brands"),
        path: tijarahPaths?.platform?.globalBrands?.index,
        icon: (
          <SvgIcon fontSize="small">
            <LocalOfferOutlinedIcon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["brand:read"]],
        featureModule: "Global  Brands",
      },
    ],
  },

  {
    subheader: t("Management"),
    items: [
      {
        title: t("Subscriptions"),
        path: tijarahPaths?.platform?.subscriptions?.index,
        icon: (
          <SvgIcon fontSize="small">
            <AccountBalanceWallet />
          </SvgIcon>
        ),
        permissions: [MoleculeType["subscription:read"]],
        featureModule: "Subscriptions",
      },
      {
        title: t("Packages"),
        path: tijarahPaths?.platform?.packages?.index,
        icon: (
          <SvgIcon fontSize="small">
            <LoyaltyOutlined />
          </SvgIcon>
        ),
        permissions: [MoleculeType["package:read"]],
        featureModule: "Packages",
      },
      {
        title: t("Users"),
        path: tijarahPaths?.platform?.platformUsers.index,
        icon: (
          <SvgIcon fontSize="small">
            <User03Icon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["platform-user:read"]],
        featureModule: "Users",
      },
      {
        title: t("Business Types"),
        path: tijarahPaths?.platform?.businessTypes?.index,
        icon: (
          <SvgIcon fontSize="small">
            <AutoAwesomeMosaicTwoToneIcon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["business-type:read"]],
        featureModule: "Business Types",
      },
      {
        title: t("Payment Types"),
        path: tijarahPaths?.platform?.paymentTypes?.index,
        icon: (
          <SvgIcon fontSize="small">
            <MonetizationOnIcon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["payment-type:read"]],
        featureModule: "Payment Types",
      },
      {
        title: t("Vat Rate"),
        path: tijarahPaths?.platform?.vatrate?.index,
        icon: (
          <SvgIcon fontSize="small">
            <ReceiptLongTwoToneIcon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["vat-rate:read"]],
        featureModule: "Vat Rate",
      },
      {
        title: t("Ads Management"),
        path: tijarahPaths.platform.adsManagement.index,
        icon: (
          <SvgIcon fontSize="small">
            <FeaturedVideoIcon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["apk-management:read"]],
        featureModule: "Ads Management",
      },
      {
        title: t("APK Management"),
        path: tijarahPaths?.platform?.apkManagement?.index,
        icon: (
          <SvgIcon fontSize="small">
            <AppSettingsAltTwoToneIcon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["apk-management:read"]],
        featureModule: "APK Management",
      },
      {
        title: t("Currencies"),
        path: tijarahPaths?.platform?.currencies?.index,
        icon: (
          <SvgIcon fontSize="small">
            <CurrencyExchangeSharp />
          </SvgIcon>
        ),
        permissions: [MoleculeType["apk-management:read"]],
        featureModule: "APK Management",
      },
      {
        title: t("ZATCA Invoices"),
        path: tijarahPaths?.zatcaInvoices?.index,
        icon: (
          <SvgIcon fontSize="small">
            <ReceiptIcon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["zatca:read"]],
        featureModule: "ZATCA Invoices",
        featureModuleKey: "zatca_invoices",
      },
    ],
  },
];

const merchantSidebar = [
  {
    items: [
      {
        title: t("Dashboard"),
        path: tijarahPaths.dashboard,
        icon: (
          <SvgIcon fontSize="small">
            <HomeSmileIcon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["dashboard:read"]],
        featureModule: "Dashboard",
        featureModuleKey: "dashboard",
        childPath: [
          tijarahPaths.dashboard.salesDashboard,
          tijarahPaths.dashboard.inventoryDashboard,
          // tijarahPaths.dashboard.otherDashboard,
        ],
        items: [
          {
            title: t("Sales"),
            path: tijarahPaths.dashboard.salesDashboard,
            permissions: [MoleculeType["dashboard:read"]],
            featureModule: "Sales",
            featureModuleKey: "sales_dashboard",
          },
          // {
          //   title: t("Inventory"),
          //   path: tijarahPaths.dashboard.inventoryDashboard,
          //   permissions: [MoleculeType["dashboard:read"]],
          //   featureModule: "Inventory",
          //   featureModuleKey: "inventory",
          // },
          // {
          //   title: t("Others"),
          //   path: tijarahPaths.dashboard.otherDashboard,
          // },
          // {
          //   title: t("Hourly Report"),
          //   path: tijarahPaths.dashboard.hourlyDashboard,
          //   permissions: [MoleculeType["dashboard:read"]],
          //   featureModule: "Hourly Report",
          //   featureModuleKey: "hourly_report",
          // },
        ],
      },
      {
        title: t("Billing"),
        path: tijarahPaths?.billing?.index,
        icon: (
          <SvgIcon fontSize="small">
            <LineChartUp04Icon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["order:create"]],
        featureModule: "Billing",
        featureModuleKey: "billing",
        childPath: [
          tijarahPaths?.billing?.index,
          tijarahPaths?.billing?.["online-order-details"],
        ],
      },
      {
        title: t("Reports"),
        path: tijarahPaths?.reports,
        icon: (
          <SvgIcon fontSize="small">
            <BarChartSquare02Icon />
          </SvgIcon>
        ),
        permissions: [
          MoleculeType["report:categories:read"],
          MoleculeType["report:product:read"],
          MoleculeType["report:shift-and-cash-drawer:read"],
          MoleculeType["report:payment-method:read"],
          MoleculeType["report:sales:read"],
          // MoleculeType["report:inventory-by-location:read"],
          MoleculeType["report:inventory:read"],
          MoleculeType["report:vat:read"],
          MoleculeType["report:sales-summary:read"],
          MoleculeType["report:ads:read"],
          MoleculeType["report:variant:read"],
          MoleculeType["report:inventory-change:read"],
        ],
        featureModule: "Sales Summary",
        featureModuleKey: "sales_summary",
        childPath: [
          tijarahPaths?.reports?.salesSummaryReport,
          tijarahPaths.reports.performanceReport,
          tijarahPaths.reports.categoriesReport,
          // tijarahPaths.reports.productsReport,
          tijarahPaths.reports.shiftsAndCashDrawerReport,
          tijarahPaths.reports.paymentMethodReport,
          tijarahPaths.reports.salesReport,
          tijarahPaths.reports.variantReport,
          tijarahPaths.reports.inventoryChangeReport,
          tijarahPaths.reports.lowInventoryReport,
          tijarahPaths.reports.deadInventoryReport,
          // tijarahPaths.reports.inventoryByLocationReport,
          tijarahPaths.reports.expiringInventory,
          tijarahPaths.reports.inventoryReport,
          tijarahPaths.reports.vatReport,
          tijarahPaths.reports.customChargeVatReport,
          tijarahPaths.reports.adsReport,
          tijarahPaths.reports.void,
          tijarahPaths.reports.comp,
          tijarahPaths.reports.productReportOrderWise,
        ],
        items: [
          {
            title: t("Sales Summary"),
            path: tijarahPaths?.reports?.salesSummaryReport,
            permissions: [MoleculeType["report:sales-summary:read"]],
            featureModule: "Sales Summary",
            featureModuleKey: "sales_summary",
          },
          {
            title: t("Orders"),
            path: tijarahPaths.reports.salesReport,
            permissions: [MoleculeType["report:sales:read"]],
            featureModule: "Order Report",
            featureModuleKey: "order_report",
          },
          // {
          //   title: t("Sales"),
          //   path: tijarahPaths.reports.newSalesReport,
          //   permissions: [MoleculeType["report:sales:read"]],
          //   featureModule: "Sales",
          //   featureModuleKey: "sales",
          // },
          {
            title: t("Payment Methods"),
            path: tijarahPaths.reports.paymentMethodReport,
            permissions: [MoleculeType["report:payment-method:read"]],
            featureModule: "Payment Methods",
            featureModuleKey: "payment_methods",
          },
          // {
          //   title: t("Low Inventory"),
          //   path: tijarahPaths.reports.lowInventoryReport,
          // },
          // {
          //   title: t("Dead Inventory"),
          //   path: tijarahPaths.reports.deadInventoryReport,
          // },
          // {
          //   title: t("Inventory By Location"),
          //   path: tijarahPaths.reports.inventoryByLocationReport,
          //   permissions: [MoleculeType["report:inventory-by-location:read"]],
          // },
          // {
          //   title: t("Expiring Inventory"),
          //   path: tijarahPaths?.reports?.expiringInventory,
          // },
          // {
          //   title: t("Inventory"),
          //   path: tijarahPaths?.reports?.inventoryReport,
          //   permissions: [MoleculeType["report:inventory:read"]],
          // },
          {
            title: t("Products"),
            childPath: [
              tijarahPaths.reports.variantReport,
              tijarahPaths.reports.productReportOrderWise,
            ],
            permissions: [MoleculeType["report:sales:read"]],
            featureModule: "Variant/Box",
            featureModuleKey: "variant_box",
            items: [
              {
                title: t(" Product Wise"),
                path: tijarahPaths.reports.variantReport,
                permissions: [MoleculeType["report:sales:read"]],
                featureModule: "Variant/Box",
                featureModuleKey: "variant_box",
              },
              {
                title: t("Order Wise"),
                path: tijarahPaths.reports.productReportOrderWise,
                permissions: [MoleculeType["report:sales:read"]],
                featureModule: "Variant/Box",
                featureModuleKey: "variant_box",
              },
            ],
          },
          // {
          //   title: t("Sales Report"),
          //   path: tijarahPaths.reports.newSalesReport,
          //   permissions: [MoleculeType["report:shift-and-cash-drawer:read"]],
          //   featureModule: "Sales Report",
          //   featureModuleKey: "sales",
          // },
          {
            title: t("Categories"),
            path: tijarahPaths.reports.categoriesReport,
            permissions: [MoleculeType["report:categories:read"]],
            featureModule: "Categories",
            featureModuleKey: "categories",
          },
          {
            title: t("Inventory"),
            path: tijarahPaths?.reports?.inventoryReport,
            permissions: [MoleculeType["report:inventory:read"]],
            featureModule: "Inventory",
            featureModuleKey: "inventory",
          },
          {
            title: t("Inventory Change"),
            path: tijarahPaths.reports.inventoryChangeReport,
            permissions: [MoleculeType["report:inventory-change:read"]],
            featureModule: "Inventory Change",
            featureModuleKey: "inventory_change",
          },
          // {
          //   title: t("Low Inventory"),
          //   path: tijarahPaths.reports.lowInventoryReport,
          // },
          // {
          //   title: t("Dead Inventory"),
          //   path: tijarahPaths.reports.deadInventoryReport,
          // },
          // {
          //   title: t("Inventory By Location"),
          //   path: tijarahPaths.reports.inventoryByLocationReport,
          //   permissions: [MoleculeType["report:inventory-by-location:read"]],
          // },
          // {
          //   title: t("Expiring Inventory"),
          //   path: tijarahPaths?.reports?.expiringInventory,
          // },
          // {
          //   title: t("Products"),
          //   path: tijarahPaths.reports.productsReport,
          //   permissions: [MoleculeType["report:product:read"]],
          // },
          {
            title: t("Shifts And Cash Drawer"),
            path: tijarahPaths.reports.shiftsAndCashDrawerReport,
            permissions: [MoleculeType["report:shift-and-cash-drawer:read"]],
            featureModule: "Shift And Cash Drawer",
            featureModuleKey: "shift_and_cash_drawer",
          },
          {
            title: t("Taxes"),
            childPath: [
              tijarahPaths.reports.vatReport,
              tijarahPaths.reports.customChargeVatReport,
            ],
            permissions: [MoleculeType["report:vat:read"]],
            featureModule: "Taxes",
            featureModuleKey: "taxes",
            items: [
              {
                title: t("Product VAT"),
                path: tijarahPaths.reports.vatReport,
                permissions: [MoleculeType["report:vat:read"]],
                featureModule: "Taxes",
                featureModuleKey: "product_vat",
              },
              {
                title: t("Custom Charges VAT"),
                path: tijarahPaths.reports.customChargeVatReport,
                permissions: [MoleculeType["report:vat:read"]],
                featureModule: "Taxes",
                featureModuleKey: "custom_charges_vat",
              },
            ],
          },
          // {
          //   title: t("Performance"),
          //   path: tijarahPaths.reports.performanceReport,
          // },
          // {
          //   title: t("Ads"),
          //   path: tijarahPaths.reports.adsReport,
          //   permissions: [MoleculeType["report:ads:read"]],
          //   featureModule: "Ads Report",
          //   featureModuleKey: "ads_report",
          // },
          {
            title: t("Void"),
            path: tijarahPaths.reports.void,
            permissions: [MoleculeType["report:sales-summary:read"]],
            featureModule: "Void",
            featureModuleKey: "void",
          },
          {
            title: t("Comp"),
            path: tijarahPaths.reports.comp,
            permissions: [MoleculeType["report:sales-summary:read"]],
            featureModule: "Comp",
            featureModuleKey: "comp",
          },
        ],
      },
      {
        title: t("Orders"),
        path: tijarahPaths?.orders,
        icon: (
          <SvgIcon fontSize="small">
            <LineChartUp04Icon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["order:read"]],
        featureModule: "Orders",
        featureModuleKey: "orders",
      },
    ],
  },
  {
    subheader: t("Inventory"),
    items: [
      {
        title: t("Inventory Management"),
        path: tijarahPaths?.inventoryManagement,
        icon: (
          <SvgIcon fontSize="small">
            <Inventory2OutlinedIcon />
          </SvgIcon>
        ),
        permissions: [
          MoleculeType["po:read"],
          MoleculeType["vendor:read"],
          MoleculeType["stock-history:read"],
        ],
        featureModule: "Inventory Management",
        featureModuleKey: "inventory_management",
        childPath: [
          tijarahPaths?.inventoryManagement?.purchaseOrder?.index,
          tijarahPaths?.inventoryManagement?.purchaseOrder?.createpo,
          tijarahPaths?.inventoryManagement?.purchaseOrder?.returnPo,
          tijarahPaths?.inventoryManagement?.stocktakes?.index,
          tijarahPaths?.inventoryManagement?.stocktakes?.create,
          tijarahPaths?.inventoryManagement?.vendor?.index,
          tijarahPaths?.inventoryManagement?.vendor?.create,
          tijarahPaths?.inventoryManagement?.internalTransfer?.index,
          tijarahPaths?.inventoryManagement?.internalTransfer?.create,
          tijarahPaths?.inventoryManagement?.history,
        ],
        items: [
          {
            title: t("Purchase Order"),
            path: tijarahPaths?.inventoryManagement?.purchaseOrder?.index,
            permissions: [MoleculeType["po:read"]],
            featureModule: "Purchase Order",
            featureModuleKey: "purchase_order",
          },
          // {
          //   title: t("Stocktakes"),
          //   path: tijarahPaths?.inventoryManagement?.stocktakes?.index,
          //   permissions: [MoleculeType["vendor:read"]],
          //   featureModule: "Stocktakes",
          //   featureModuleKey: "stocktakes",
          // },
          {
            title: t("Vendor"),
            path: tijarahPaths?.inventoryManagement?.vendor?.index,
            permissions: [MoleculeType["vendor:read"]],
            featureModule: "Vendors",
            featureModuleKey: "vendors",
          },
          {
            title: t("Internal Transfer"),
            path: tijarahPaths?.inventoryManagement?.internalTransfer?.index,
            permissions: [MoleculeType["vendor:read"]],
            featureModule: "Internal Transfer",
            featureModuleKey: "internal_transfer",
          },
          {
            title: t("History"),
            path: tijarahPaths?.inventoryManagement?.history,
            permissions: [MoleculeType["stock-history:read"]],
            featureModule: "Inventory History",
            featureModuleKey: "inventory_history",
          },
        ],
      },
      // {
      //   title: t("Barcode Print"),
      //   path: tijarahPaths?.barcodePrint,
      //   icon: (
      //     <SvgIcon fontSize="small">
      //       <DocumentScannerIcon />
      //     </SvgIcon>
      //   ),
      //   permissions: [MoleculeType["order:read"]],
      // },
    ],
  },
  {
    subheader: t("Catalogue"),
    items: [
      {
        title: t("Product Catalogue"),
        path: tijarahPaths?.catalogue,
        icon: (
          <SvgIcon fontSize="small">
            <ShoppingBag03Icon />
          </SvgIcon>
        ),
        permissions: [
          MoleculeType["product:read"],
          MoleculeType["global-product:read"],
          MoleculeType["custom-charge:read"],
        ],
        featureModule: "Product Catalogue",
        featureModuleKey: "product_catalogue",
        childPath: [
          tijarahPaths?.catalogue?.products?.index,
          tijarahPaths?.catalogue?.products?.create,
          tijarahPaths?.catalogue?.compositeProducts?.index,
          tijarahPaths?.catalogue?.compositeProducts?.create,
          tijarahPaths?.catalogue?.globalProducts?.index,
          tijarahPaths?.catalogue?.globalProducts?.view,
          tijarahPaths.catalogue.customCharges.index,
          tijarahPaths.catalogue.customCharges.create,
          tijarahPaths.catalogue.priceAdjustment.index,
          tijarahPaths.catalogue.priceAdjustment.create,
          tijarahPaths.catalogue.modifiers.index,
          tijarahPaths.catalogue.modifiers.create,
          tijarahPaths.catalogue.boxesAndCrates.index,
          tijarahPaths.catalogue.boxesAndCrates.create,
          tijarahPaths.catalogue.volumetricPricing.index,
          tijarahPaths.catalogue.volumetricPricing.create,
        ],
        items: [
          {
            title: t("Products"),
            path: tijarahPaths?.catalogue?.products?.index,
            permissions: [MoleculeType["product:read"]],
            featureModule: "Products",
            featureModuleKey: "products",
          },
          {
            title: t("Composite Product"),
            path: tijarahPaths?.catalogue?.compositeProducts?.index,
            permissions: [MoleculeType["product:read"]],
            featureModule: "Composite Products",
            featureModuleKey: "composite_products",
          },
          {
            title: t("Global Products"),
            path: tijarahPaths?.catalogue?.globalProducts?.index,
            permissions: [MoleculeType["global-product:read"]],
            featureModule: "Global Products",
            featureModuleKey: "global_products",
          },
          {
            title: t("Boxes and Crates"),
            path: tijarahPaths?.catalogue?.boxesAndCrates.index,
            permissions: [MoleculeType["boxes-crates:read"]],
            featureModule: "Boxes and Crates",
            featureModuleKey: "boxes_and_crates",
          },
          {
            title: t("Custom Charges"),
            path: tijarahPaths.catalogue.customCharges.index,
            permissions: [MoleculeType["custom-charge:read"]],
            featureModule: "Custom Charges",
            featureModuleKey: "custom_charges",
          },
          {
            title: t("Price Adjustment"),
            path: tijarahPaths.catalogue.priceAdjustment.index,
            permissions: [MoleculeType["bulk-price-update:read"]],
            featureModule: "Price Adjustment",
            featureModuleKey: "price_adjustment",
          },
          // {
          //   title: t("Volumetric Pricing"),
          //   path: tijarahPaths.catalogue.volumetricPricing.index,
          //   permissions: [MoleculeType["bulk-price-update:read"]],
          //   featureModule: "Volumetric Pricing",
          //   featureModuleKey: "volumetric_pricing",
          // },
          {
            title: t("Modifiers"),
            path: tijarahPaths.catalogue.modifiers.index,
            permissions: [MoleculeType["modifier:read"]],
            featureModule: "Modifiers",
            featureModuleKey: "modifiers",
          },
        ],
      },
      {
        title: t("Categories"),
        path: tijarahPaths?.catalogue?.categories?.index,
        icon: (
          <SvgIcon fontSize="small">
            <CategoryTwoToneIcon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["category:read"]],
        featureModule: "Categories",
        featureModuleKey: "categories",
      },
      {
        title: t("Collections"),
        path: tijarahPaths?.catalogue?.collections?.index,
        icon: (
          <SvgIcon fontSize="small">
            <CollectionsTwoTone />
          </SvgIcon>
        ),
        permissions: [MoleculeType["collection:read"]],
        featureModule: "Collections",
        featureModuleKey: "collections",
      },
      {
        title: t("Menu Management"),
        path: tijarahPaths?.catalogue?.menu?.index,
        icon: (
          <SvgIcon fontSize="small">
            <Menu />
          </SvgIcon>
        ),
        permissions: [MoleculeType["collection:read"]],
        featureModule: "Menu Management",
        featureModuleKey: "menu_management",
      },
    ],
  },
  {
    subheader: t("Management"),
    items: [
      {
        title: t("Audit Logs"),
        path: tijarahPaths?.platform?.auditLogs,
        icon: (
          <SvgIcon fontSize="small">
            <VerifiedUserIcon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["audit-log:read"]],
        featureModule: "Audit Log",
        featureModuleKey: "audit_log",
      },
      {
        title: t("Customers"),
        path: tijarahPaths?.management?.customers?.index,
        icon: (
          <SvgIcon fontSize="small">
            <Users03Icon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["customer:read"]],
        featureModule: "Customers",
        featureModuleKey: "customers",
      },
      {
        title: t("Locations"),
        path: tijarahPaths?.management?.locations,
        icon: (
          <SvgIcon fontSize="small">
            <FmdGoodTwoToneIcon />
          </SvgIcon>
        ),
        permissions: [
          MoleculeType["location:read"],
          MoleculeType["device:read"],
          MoleculeType["user:read"],
          MoleculeType["user:read"],
        ],
        featureModule: "Locations",
        featureModuleKey: "locations",
        childPath: [
          tijarahPaths?.management?.locations?.list?.index,
          tijarahPaths?.management?.locations?.create,
          // tijarahPaths?.management?.devices?.index,
          // tijarahPaths?.management?.devices?.create,
          tijarahPaths?.management?.locations?.users?.index,
          tijarahPaths?.management?.locations?.users?.create,
        ],
        items: [
          {
            title: t("My Locations"),
            path: tijarahPaths?.management?.locations?.list?.index,
            tag: tijarahPaths?.management?.locations?.create,
            permissions: [MoleculeType["location:read"]],
            featureModule: "My Locations",
            featureModuleKey: "my_locations",
          },
          // {
          //   title: t("Devices"),
          //   path: tijarahPaths?.management?.devices?.index,
          //   permissions: [MoleculeType["device:read"]],
          // },
          {
            title: t("Users"),
            path: tijarahPaths?.management?.locations?.users?.index,
            permissions: [MoleculeType["user:read"]],
            featureModule: "Users",
            featureModuleKey: "users",
          },
        ],
      },
      {
        title: t("Device Management"),
        path: tijarahPaths?.management?.devicesManagement,
        icon: (
          <SvgIcon fontSize="small">
            <DevicesIcon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["device:read"], MoleculeType["device:read"]],
        featureModule: "Device Management",
        featureModuleKey: "device_management",
        childPath: [
          tijarahPaths?.management?.devicesManagement?.devices?.index,
          tijarahPaths?.management?.devicesManagement?.devices?.create,
          tijarahPaths?.management?.devicesManagement?.kitchen?.index,
          tijarahPaths?.management?.devicesManagement?.kitchen?.create,
        ],
        items: [
          {
            title: t("Devices"),
            path: tijarahPaths?.management?.devicesManagement?.devices?.index,
            permissions: [MoleculeType["device:read"]],
            featureModule: "Devices",
            featureModuleKey: "devices",
          },
          {
            title: t("Kitchens"),
            path: tijarahPaths?.management?.devicesManagement?.kitchen?.index,
            permissions: [MoleculeType["device:read"]],
            featureModule: "Kitchens",
            featureModuleKey: "kitchens",
          },
        ],
      },
      {
        title: t("Discounts"),
        path: tijarahPaths?.management?.discounts?.index,
        icon: (
          <SvgIcon fontSize="small">
            <AccountBalanceWalletTwoToneIcon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["coupon:read"]],
        featureModule: "Discounts",
        featureModuleKey: "discounts",
      },
      {
        title: t("Section & Table"),
        path: tijarahPaths?.management?.sectionTable?.index,
        icon: (
          <SvgIcon fontSize="small">
            <BackupTableIcon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["coupon:read"]],
        featureModule: "Section Tables",
        featureModuleKey: "section_tables",
      },
      {
        title: t("Promotions"),
        path: tijarahPaths?.management?.promotions?.index,
        icon: (
          <SvgIcon fontSize="small">
            <DiscountTwoTone />
          </SvgIcon>
        ),
        permissions: [MoleculeType["promotion:read"]],
        featureModule: "Promotions",
        featureModuleKey: "promotions",
      },
      {
        title: t("Ads Management"),
        path: tijarahPaths.platform.adsManagement.index,
        icon: (
          <SvgIcon fontSize="small">
            <FeaturedVideoIcon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["ads:read"]],
        featureModule: "Ads Management",
        featureModuleKey: "ads_management",
      },
      // {
      //   title: t("Timed Events"),
      //   path: tijarahPaths.management.timedEvents.index,
      //   icon: (
      //     <SvgIcon fontSize="small">
      //       <AccessTimeIcon />
      //     </SvgIcon>
      //   ),
      //   permissions: [MoleculeType["timed-event:read"]],
      //   featureModule: "Timed Events",
      //   featureModuleKey: "timed_events",
      // },
      {
        title: t("Account"),
        path: tijarahPaths?.management?.account,
        icon: (
          <SvgIcon fontSize="small">
            <Building04Icon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["account:read"]],
        featureModule: "Account",
        featureModuleKey: "account",
      },
      // {
      //   title: t("My Profile"),
      //   path: tijarahPaths?.management?.profile,
      //   icon: (
      //     <SvgIcon fontSize="small">
      //       <User03Icon />
      //     </SvgIcon>
      //   ),
      //   permissions: [MoleculeType["account:read"]],
      // },
    ],
  },
  {
    subheader: t("Accounting"),
    items: [
      {
        title: t("Accounting"),
        path: tijarahPaths?.accounting.accounting.index,
        icon: (
          <SvgIcon fontSize="small">
            <MonetizationOnIcon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["category:read"]],
        featureModule: "Accounting",
        featureModuleKey: "accounting",
      },
      {
        title: t("ZATCA Invoices"),
        path: tijarahPaths?.zatcaInvoices?.index,
        icon: (
          <SvgIcon fontSize="small">
            <ReceiptIcon />
          </SvgIcon>
        ),
        permissions: [MoleculeType["zatca:read"]],
        featureModule: "ZATCA Invoices",
        featureModuleKey: "zatca_invoices",
      },
      // {
      //   title: t("Miscellaneous Expenses"),
      //   path: tijarahPaths?.management?.miscellaneousExpenses?.index,
      //   icon: (
      //     <SvgIcon fontSize="small">
      //       <MonetizationOnIcon />
      //     </SvgIcon>
      //   ),
      //   permissions: [MoleculeType["customer:read"]],
      //   featureModule: "Miscellaneous Expenses",
      //   featureModuleKey: "miscellaneous_expenses",
      // },
    ],
  },
];

export const useSections = () => {
  const { userType } = useUserType();

  return useMemo(() => {
    return userType == USER_TYPES.SUPERADMIN
      ? superAdminSidebar
      : merchantSidebar;
  }, [t, userType]);
};
