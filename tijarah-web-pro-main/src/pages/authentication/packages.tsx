import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Divider,
  Unstable_Grid2 as Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Faq } from "src/components/authentication/package/faq";
import { ModuleSummary } from "src/components/authentication/package/module-summary";
import PricingTable from "src/components/authentication/pricing-plan-table";
import { Seo } from "src/components/seo";
import LoaderAnimation from "src/components/widgets/animations/loader";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as MarketingLayout } from "src/layouts/marketing";
import { PackageTopNav } from "src/layouts/marketing/package-top-nav";
import { PricingPlan } from "src/sections/pricing/pricing-plan";
import HubspotContactForm from "./HubspotForm";

const faqs = [
  {
    id: "FAQ-5",

    question: { en: "Why Tijarah360?", ar: "لماذا تجارة 360؟ " },
    answer: {
      en: "Tijarah360 started with simplifying retail, but now provides a complete set of tools to run retail and hospitality businesses. We're dedicated to empowering businesses of all scales to succeed independently",
      ar: "بدأت تجارة 360 بتبسيط البيع بالتجزئة ، ولكنها توفر الآن مجموعة كاملة من الأدوات لتشغيل أعمال التجزئة والضيافة. نحن ملتزمون بتمكين الشركات من جميع المقاييس للنجاح بشكل مستقل",
    },
  },
  {
    id: "FAQ-4",
    question: {
      en: "Is it possible to get someone to set up my POS system for me?",
      ar: "هل من الممكن حث شخص ما على إعداد نظام نقاط البيع الخاص بي من أجلي؟",
    },
    answer: {
      en: "Absolutely! Our product experts are happy to visit you and handle the entire POS system setup. They'll get everything up and running smoothly, and even train you and your staff on its use. This way, you can focus on running your business without worrying about the technical aspects.",
      ar: " يسعد خبراء منتجاتنا بزيارتك والتعامل مع إعداد نظام نقاط البيع بالكامل. سوف يرفعون كل شيء ويعملون بكل سلاسة ، وحتى تدريبك أنت وموظفيك على استخدامه. وبهذه الطريقة ، يمكنك التركيز على إدارة عملك دون القلق بشأن الجوانب الفنية.",
    },
  },
  {
    id: "FAQ-3",
    question: {
      en: "Will Tijarah360 works for me if I don't have stable internet connection?",
      ar: "هل يعمل تجارة 360 بالنسبة لي إذا لم يكن لدي اتصال إنترنت؟",
    },
    answer: {
      en: "Even when your internet connection isn't reliable, Tijarah360 has your back. Our offline mode allows you to seamlessly continue selling, ensuring you don't miss any potential opportunities.",
      ar: "حتى عندما لا يكون اتصال الإنترنت الخاص بك موثوقًا ، فإن تجارة 360 لديه ظهرك. يتيح لك وضعنا غير المتصل بالمواصلة بسلاسة في البيع ، مما يضمن عدم تفويت أي فرص محتملة.",
    },
  },
  {
    id: "FAQ-2",
    question: {
      en: "Can I use my existing hardware with Tijarah360?",
      ar: "هل يمكنني استخدام أجهزتي الحالية مع تجارة 360 ؟",
    },
    answer: {
      en: "There's a strong possibility that your existing printers, scanners, and other equipment will work seamlessly with Tijarah360.",
      ar: "هناك احتمال قوي بأن تعمل الطابعات والماسحات الضوئية الحالية والمعدات الأخرى بسلاسة مع تجارة360. ",
    },
  },
  {
    id: "FAQ-1",
    question: {
      en: "Happy with my POS, what Tijarah360 features might make me reconsider?",
      ar: "أنا سعيد مع نقاط البيع الخاصة بي ، ما هي ميزات تجارة 360 التي قد تجعلني أعيد النظر؟",
    },
    answer: {
      en: "Many businesses ditch traditional POS for Tijarah360, praising its ease of use and powerful functionalities.",
      ar: "تتخلى العديد من الشركات عن نقاط البيع التقليدية لـ تجارة 360  ، مشيدًا بسهولة الاستخدام والوظائف القوية.",
    },
  },
] as { id: string; question: any; answer: any }[];

const ModuleData = [
  {
    title: { en: "Billing", ar: "الفواتير" },
    icon: "/assets/module-icon/point-of-service.png",
    list: [
      {
        en: "POS Billing",
        ar: "فاتورة نقاط البيع",
      },
      {
        en: "Catalogue Management",
        ar: "إدارة الكتالوجات",
      },
      {
        en: "Multiple Tickets",
        ar: "تذاكر متعددة",
      },
      {
        en: "Multiple Payment types",
        ar: "أنواط دفع متعددة",
      },
      {
        en: "Discounts",
        ar: "خصومات",
      },
      {
        en: "Orders",
        ar: "طلبات",
      },
      {
        en: "Refunds",
        ar: "استردادات",
      },
      {
        en: "Shift / Cash Management",
        ar: "إدارة الورديات / النقدية",
      },
      {
        en: "Walk-in",
        ar: "زائر بدون موعد",
      },
      {
        en: "Delivery",
        ar: "توصيل",
      },
    ],
  },
  {
    title: { en: "Stock & Inventory", ar: "المخزون والجرد" },
    icon: "/assets/module-icon/in-stock.png",
    list: [
      {
        en: "Vendor Management",
        ar: "إدارة الموردين",
      },
      {
        en: "Stock tracking",
        ar: "تتبع المخزون",
      },
      {
        en: "Negative Billing",
        ar: "الفوترة السالبة",
      },
      {
        en: "PO & GRN",
        ar: "أمر الشراء ومذكرة استلام البضائع",
      },
      {
        en: "Stocktake (Stock Counting)",
        ar: "جرد المخزون",
      },
      {
        en: "Stock Transfer",
        ar: "نقل المخزون",
      },
      {
        en: "Stock Batch Management",
        ar: "إدارة دفعات المخزون",
      },
    ],
  },
  {
    title: { en: "Interfaces", ar: "الواجهات" },
    icon: "/assets/module-icon/website-design.png",
    list: [
      {
        en: "Merchant dashboard - WEB",
        ar: "لوحة تحكم التاجر - الويب",
      },
      {
        en: "POS - Android, Web, iOS(Coming soon)",
        ar: "POS - أندرويد، ويب، iOS (قريبًا)",
      },
      {
        en: "Insights App - Android, iOS",
        ar: "تطبيق Insights - Android، iOS",
      },
      {
        en: "Online ordering - Web",
        ar: "الطلب عبر الإنترنت - الويب",
      },
    ],
  },
  {
    title: { en: "Customers", ar: "العملاء" },
    icon: "/assets/module-icon/customer.png",
    list: [
      {
        en: "Customers profile",
        ar: "ملفات العملاء",
      },
      {
        en: "Loyalty/rewards points",
        ar: "نقاط الولاء / المكافآت",
      },
      {
        en: "Customer app for rewards (Coming soon)",
        ar: "تطبيق العملاء للمكافآت (قريبًا)",
      },
      {
        en: "Credit management",
        ar: "إدارة الائتمان",
      },
    ],
  },
  {
    title: { en: "Reports & Insights", ar: "التقارير والتحليلات" },
    icon: "/assets/module-icon/dashboard.png",
    list: [
      {
        en: "Business Reports",
        ar: "تقارير الأعمال",
      },
      {
        en: "Stock Alerts",
        ar: "تنبيهات الأسهم",
      },

      {
        en: "Store & staff performance reports",
        ar: "تقارير أداء المتجر والموظفين",
      },
      {
        en: "Actionable Customer insights",
        ar: "رؤى العملاء القابلة للتنفيذ",
      },
      {
        en: "Actionable Business insights",
        ar: "رؤى الأعمال القابلة للتنفيذ",
      },
      {
        en: "Dedicated Insights App",
        ar: "تطبيق رؤى مخصصة",
      },
    ],
  },
  {
    title: { en: "Notifications", ar: "الإشعارات" },
    icon: "/assets/module-icon/notifications.png",
    list: [
      {
        en: "Automated Push notifications",
        ar: "إشعارات الدفع التلقائيّة",
      },
    ],
  },
  {
    title: { en: "Promotions", ar: "العروض الترويجية" },
    icon: "/assets/module-icon/promotion.png",
    list: [
      {
        en: "Upsell",
        ar: "زيادة المبيعات",
      },
      {
        en: "Cross sell",
        ar: "بيع متقاطع",
      },
      {
        en: "Combo",
        ar: "مجموعة",
      },
      {
        en: "and many more",
        ar: "وغيرها الكثير",
      },
    ],
  },
  {
    title: { en: "Loyalty", ar: "الولاء" },
    icon: "/assets/module-icon/loyalty-program.png",
    list: [
      {
        en: "Redeemable rewards points",
        ar: "نقاط مكافآت قابلة للاسترداد",
      },
      {
        en: "Settings based on business needs",
        ar: "إعدادات بناءً على احتياجات العمل",
      },
    ],
  },
  {
    title: { en: "Accounting", ar: "المحاسبة" },
    icon: "/assets/module-icon/accounting.png",
    list: [
      {
        en: "Credit and debit transactions",
        ar: "المعاملات الائتمانية والمدينة",
      },
      {
        en: "Track upcoming credits and debits",
        ar: "تتبع الائتمانات والمديونيات القادمة",
      },
      {
        en: "Manage expenses",
        ar: "إدارة النفقات",
      },
    ],
  },

  {
    title: { en: "Ads", ar: "الإعلانات" },
    icon: "/assets/module-icon/online-advertising.png",
    list: [
      {
        en: "Image & Video Ads",
        ar: "إعلانات الصور والفيديو",
      },
      {
        en: "Ads Report",
        ar: "تقرير الإعلانات",
      },
    ],
  },

  {
    title: { en: "Others", ar: "آخرى" },
    icon: "/assets/module-icon/menu.png",
    list: [
      {
        en: "Multi-user login",
        ar: "تسجيل الدخول متعدد المستخدمين",
      },
      {
        en: "Multi-location",
        ar: "مواقع متعددة",
      },
      {
        en: "Offline support",
        ar: "الدعم دون الاتصال بالإنترنت",
      },
      {
        en: "Multi-lingual (English, Arabic & Urdu)",
        ar: "متعدد اللغات (الإنجليزية، العربية، والأردية)",
      },
    ],
  },
];

interface PackagePropsType {
  fromGateway?: boolean;
  setOpenPlanModal?: any;
}

const Packages = (props: PackagePropsType) => {
  const { t } = useTranslation();
  usePageView();

  const { fromGateway, setOpenPlanModal } = props;
  const [selectedHardware, setSelectedHardware] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState<string>();
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [billingCycle, setBillingCycle] = useState<
    "monthly" | "quarterly" | "annually"
  >("quarterly"); // Default to quarterly instead of monthly
  const [maxAnnualDiscount, setMaxAnnualDiscount] = useState<number>(0);

  const { find, entities, loading } = useEntity("package");

  const handleSelectedHardware = (hardware: any, qty?: number) => {
    setSelectedHardware((prev) => {
      const exists = prev.some((hw) => hw.key === hardware.key);

      // If qty is provided, update or add with quantity
      if (qty !== undefined) {
        if (qty <= 0) {
          // Remove hardware if quantity is 0 or negative
          return prev.filter((hw) => hw.key !== hardware.key);
        }

        if (exists) {
          // Update existing hardware with new quantity
          return prev.map((hw) =>
            hw.key === hardware.key ? { ...hw, qty } : hw
          );
        } else {
          // Add new hardware with quantity
          return [...prev, { ...hardware, qty }];
        }
      } else {
        // Original toggle behavior (for checkbox)
        if (exists) {
          return prev.filter((hw) => hw.key !== hardware.key);
        } else {
          return [...prev, { ...hardware, qty: 1 }];
        }
      }
    });
  };

  const handleSelectedAddon = (addon: any, pkg?: any) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.key === addon.key);

      // Handle regular addons (non-location/device)
      if (
        exists &&
        addon.key !== "location_addon" &&
        addon.key !== "device_addon"
      ) {
        return prev.filter((a) => a.key !== addon.key);
      }

      // Handle location addon
      if (addon.key === "location_addon") {
        const additionalLocations = addon.qty - pkg.locationLimit;
        if (additionalLocations <= 0) {
          return prev.filter((a) => a.key !== "location_addon");
        }
        return [
          ...prev.filter((a) => a.key !== "location_addon"),
          { ...addon, qty: additionalLocations },
        ];
      }

      // Handle device addon
      if (addon.key === "device_addon") {
        const additionalDevices = addon.qty - pkg.deviceLimit;
        if (additionalDevices <= 0) {
          return prev.filter((a) => a.key !== "device_addon");
        }
        return [
          ...prev.filter((a) => a.key !== "device_addon"),
          { ...addon, qty: additionalDevices },
        ];
      }

      return [...prev, addon];
    });
  };

  useEffect(() => {
    find({ page: 0, limit: 100000, sort: "desc", activeTab: "active" });
  }, []);

  // Calculate the maximum discount percentage for annually billing cycle
  useEffect(() => {
    if (entities?.results?.length > 0) {
      let maxDiscount = 0;
      entities.results.forEach((plan) => {
        const annualPrice = plan.prices.find(
          (p: { type: string; price: number; discountPercentage: number }) =>
            p.type === "annually"
        );
        if (annualPrice && annualPrice.discountPercentage > maxDiscount) {
          maxDiscount = annualPrice.discountPercentage;
        }
      });
      setMaxAnnualDiscount(maxDiscount);
    }
  }, [entities?.results]);

  const plans = entities?.results || [];

  return (
    <>
      <Seo title="Pricing" />
      <PackageTopNav />
      <Box
        sx={{
          bgcolor: "var(--mui-palette-neutral-950)",
          color: "var(--mui-palette-common-white)",
          overflow: "hidden",
          pt: "140px",
          pb: "0",
          position: "relative",
        }}
      >
        <Stack spacing={6} sx={{ position: "relative", zIndex: 1 }}>
          <Container maxWidth="md">
            <Stack spacing={2}>
              <Typography sx={{ textAlign: "center" }} variant="h3">
                {t("Start today.")}
              </Typography>
              <Typography sx={{ mt: 1, textAlign: "center" }} variant="h5">
                {t("Boost up your services with Tijarah360")}
              </Typography>
            </Stack>
          </Container>
        </Stack>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 1,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Box
              id="card-2"
              sx={{
                width: "100%",
                mx: "auto",
                mb: 5,
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "neutral.800" : "neutral.50",
              }}
            >
              <Box sx={{ pb: "20px", pt: "30px" }}>
                <Container maxWidth="lg">
                  {loading ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", py: 8 }}
                    >
                      <LoaderAnimation />
                    </Box>
                  ) : (
                    <>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mb: 4,
                        }}
                      >
                        <ButtonGroup
                          size="medium"
                          sx={{
                            width: { xs: "100%", sm: "auto" },
                            maxWidth: "350px",
                            display: "flex",
                            justifyContent: "center",
                            backgroundColor: "background.paper",
                            borderRadius: 1,
                            p: 0.5,
                            textTransform: "uppercase",
                          }}
                        >
                          {/* Monthly billing option temporarily disabled
                          <Button
                            variant={
                              billingCycle === "monthly" ? "contained" : "outlined"
                            }
                            onClick={() => setBillingCycle("monthly")}
                            sx={{
                              textTransform: "none",
                              px: 2,
                              minWidth: "auto",
                              width: "auto",
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{t("Monthly")}</Typography>
                          </Button>
                          */}
                          <Button
                            variant={
                              billingCycle === "quarterly"
                                ? "contained"
                                : "outlined"
                            }
                            onClick={() => setBillingCycle("quarterly")}
                            sx={{
                              textTransform: "none",
                              px: 2,
                              minWidth: "auto",
                              width: "auto",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "medium" }}
                            >
                              {t("Quarterly")}
                            </Typography>
                          </Button>
                          <Button
                            variant={
                              billingCycle === "annually"
                                ? "contained"
                                : "outlined"
                            }
                            onClick={() => setBillingCycle("annually")}
                            sx={{
                              textTransform: "none",
                              px: 2,
                              minWidth: "auto",
                              width: "auto",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: "medium" }}
                              >
                                {t("Annually")}
                              </Typography>
                              {maxAnnualDiscount > 0 && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color:
                                      billingCycle === "annually"
                                        ? "inherit"
                                        : "success.main",
                                    fontWeight: "medium",
                                  }}
                                >
                                  ({t("SAVE")} {maxAnnualDiscount}%)
                                </Typography>
                              )}
                            </Box>
                          </Button>
                        </ButtonGroup>
                      </Box>
                      <Grid container spacing={4}>
                        {plans.map((plan) => (
                          <Grid key={plan._id} xs={12} md={4}>
                            <PricingPlan
                              sx={{
                                height: "100%",
                                mx: "auto",
                              }}
                              packageData={plan}
                              planSelected={plans.find(
                                (p) => p._id === selectedPlan
                              )}
                              selectedPlan={selectedPlan}
                              setSelectedPlan={(planId) => {
                                setSelectedPlan(planId);
                                setSelectedAddons([]);
                                setSelectedHardware([]);
                              }}
                              fromGateway={fromGateway}
                              setOpenPlanModal={setOpenPlanModal}
                              resetHardware={() => setSelectedHardware([])}
                              handleSelectedHardware={handleSelectedHardware}
                              selectedHardware={selectedHardware}
                              handleDefaultSelectedHardware={(data: any) => {
                                setSelectedHardware(data);
                              }}
                              handleSelectedAddon={handleSelectedAddon}
                              selectedAddons={selectedAddons}
                              billingCycle={billingCycle}
                              setBillingCycle={setBillingCycle}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  )}
                </Container>
              </Box>
            </Box>

            {/* Rest of the component remains the same */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={3}
              sx={{ alignItems: "center", justifyContent: "center" }}
            >
              <Box>
                <Typography variant="h4" textAlign={"center"}>
                  {t("Modules")}
                </Typography>
              </Box>
            </Stack>
            <Box sx={{ py: "20px" }}>
              <Container maxWidth="lg">
                <Grid container spacing={4}>
                  {ModuleData.map((data: any, index: any) => (
                    <Grid md={3} key={index} xs={6}>
                      <ModuleSummary
                        icon={data.icon}
                        title={data.title}
                        listdata={data.list}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Container>
            </Box>

            <Divider style={{ marginBottom: "40px" }} />

            <Box
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "neutral.800" : "neutral.50",
              }}
            >
              <Container maxWidth="lg">
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={3}
                  sx={{
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                  }}
                >
                  <Box>
                    <Typography variant="h4" textAlign={"center"}>
                      {t("Features")}
                    </Typography>
                  </Box>
                </Stack>
                <PricingTable />
              </Container>
            </Box>

            <Box sx={{ py: "120px" }}>
              <Container maxWidth="lg">
                <Grid container spacing={5}>
                  <Grid md={6} xs={12}>
                    <Stack spacing={2} sx={{ mb: 2 }}>
                      <Typography variant="h3">
                        {t("Everything you need to know")}
                      </Typography>
                      <Typography color="text.secondary" variant="subtitle2">
                        {" Frequently asked questions"}
                      </Typography>
                    </Stack>
                    <Stack spacing={3}>
                      {faqs.map((faq) => (
                        <Faq key={faq.id} {...faq} />
                      ))}
                    </Stack>
                  </Grid>
                  <Grid md={6} xs={12}>
                    <Stack spacing={3}>
                      <Typography variant="h3">
                        {t(
                          "Contact us today for any inquiries; we're here to help!"
                        )}
                      </Typography>
                      <HubspotContactForm
                        region="na1"
                        portalId="46532737"
                        formId="6a920e8e-43f3-4b51-8373-8b7fc092c064"
                        scriptSrc="https://js.hsforms.net/forms/shell.js"
                        cotainerID="hubspotform"
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </Container>
            </Box>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Packages.getLayout = (page: any) => <MarketingLayout>{page}</MarketingLayout>;

export default Packages;
