const { faker } = require("@faker-js/faker");

describe("Tijarah360 End-to-End Signup Flow", () => {
  const userData = {
    name: faker.name.fullName(),
    email: faker.internet.email(),
    phone: `+91-${faker.string.numeric({ length: { min: 10, max: 10 } })}`,
    password: "12345678",
    country: "%2B966",
  };

  const subData = {
    state: {
      subscriptionData: {
        subscription: {
          _id: "6822ac351897522b006c3ed9",
          ownerRef: "6822ac2f9229cfafeb06fb92",
          __v: 0,
          addons: [],
          billing: {
            total: 500,
            subtotal: 500,
            discount: 0,
            packageAmount: 500,
            addonAmount: 0,
            hardwareAmount: 0,
          },
          billingCycle: "quarterly",
          createdAt: "2025-05-13T02:19:33.315Z",
          currentDeviceLimit: 1,
          currentLocationLimit: 1,
          fileUrl: "",
          hardwares: [],
          isTrial: false,
          modules: [
            {
              name: "Billing",
              key: "billing",
              subModules: [
                { key: "billing", name: "Billing" },
                { key: "orders", name: "Orders" },
              ],
            },
            {
              name: "Device Management",
              key: "device_management",
              subModules: [
                { key: "device_management", name: "Device Management" },
                { key: "devices", name: "Devices" },
              ],
            },
            {
              name: "Catalogue",
              key: "product_catalogue",
              subModules: [
                { key: "product_catalogue", name: "Product Catalogue" },
                { key: "products", name: "Products" },
                { key: "categories", name: "Categories" },
                { key: "collections", name: "Collections" },
                { key: "global_products", name: "Global Products" },
                { key: "price_adjustment", name: "Price Adjustment" },
              ],
            },
            {
              name: "Locations",
              key: "locations",
              subModules: [
                { key: "locations", name: "Locations" },
                { key: "my_locations", name: "My Locations" },
                { key: "users", name: "Users" },
              ],
            },
            {
              name: "General",
              key: "general",
              subModules: [
                { key: "timed_events", name: "Timed Events" },
                { key: "account", name: "Account" },
                { key: "audit_log", name: "Audit Log" },
              ],
            },
            {
              name: "Customers",
              key: "customers",
              subModules: [{ key: "customers", name: "Customers" }],
            },
            {
              name: "Discounts",
              key: "discounts",
              subModules: [{ key: "discounts", name: "Discounts" }],
            },
            {
              name: "Insights App",
              key: "insights_app",
              subModules: [{ key: "insights_app", name: "Insights App" }],
            },
            {
              name: "Credit Management",
              key: "credit_management",
              subModules: [
                { key: "credit_management", name: "Credit Management" },
              ],
            },
            {
              name: "Dashboards",
              key: "dashboard",
              subModules: [
                { key: "dashboard", name: "Dashboard" },
                { key: "hourly_report", name: "Hourly Report" },
                { key: "sales_dashboard", name: "Sales Dashboard" },
                { key: "others", name: "Others" },
              ],
            },
            {
              name: "Sales Reports",
              key: "sales_reports",
              subModules: [
                { key: "reports", name: "Reports" },
                { key: "sales_summary", name: "Sales Summary" },
                { key: "order_report", name: "Order Report" },
                { key: "sales", name: "Sales" },
                { key: "payment_methods", name: "Payment Methods" },
                { key: "variant_box", name: "Variant/Box" },
                { key: "taxes", name: "Taxes" },
                { key: "shift_and_cash_drawer", name: "Shift And Cash Drawer" },
                { key: "product_vat", name: "Product Vat" },
                { key: "custom_charges_vat", name: "Custom Charges Vat" },
                { key: "void", name: "Void" },
                { key: "comp", name: "Comp" },
              ],
            },
            {
              name: "Menu Management",
              key: "menu_management",
              subModules: [{ key: "menu_management", name: "Menu Management" }],
            },
          ],
          note: "adsa",
          package: { en: "Starter", ar: "بداية" },
          packageRef: "6814cc15da42c52b2efde6a4",
          paymentMethod: "cash",
          paymentProofUrl: "",
          paymentStatus: "unpaid",
          paymentType: "offline",
          referralCode: "",
          salesPerson: "asdas",
          status: "active",
          subscriptionEndDate: "2025-08-11T02:19:33.313Z",
          subscriptionStartDate: "2025-05-13T02:19:33.313Z",
          transactionId: "2sdasdas",
          updatedAt: "2025-05-13T02:19:33.315Z",
          validityInMonths: 3,
        },
      },
    },
    version: 0,
  };

  beforeEach(() => {
    cy.restoreLocalStorage();
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  it("Selects Card and clicks Continue", () => {
    cy.visit("https://tijarah-qa.vercel.app/authentication/packages");
    cy.get(".MuiCard-root", { timeout: 10000 }).should(
      "have.length.at.least",
      1
    );
    cy.contains(".MuiCard-root", "SAR 500.00").should("be.visible").click();
    cy.wait(1000);
    cy.contains(".MuiCard-root", "SAR 500.00").within(() => {
      cy.contains("button", "Continue").should("be.enabled").click();
    });

    // cy.visit("https://tijarah-qa.vercel.app/authentication/register");

    cy.get('input[name="name"]').should("be.visible").type(userData.name);

    cy.get('input[name="email"]').should("be.visible").type(userData.email);

    cy.get('input[id="phone"]')
      .should("be.visible")
      .clear()
      .type(userData.phone);

    cy.get('input[name="password"]')
      .should("be.visible")
      .type(userData.password);

    cy.get('input[name="confirmPassword"]')
      .should("be.visible")
      .type(userData.password);

    cy.get('input[name="policy"]').check({ force: true });

    cy.contains("button", "Register").click();
    cy.wait(2000);

    cy.url().should("include", "/authentication/otp-verify");
    const otpCode = ["8", "0", "0", "0"];
    otpCode.forEach((digit, index) => {
      cy.get("input").eq(index).should("be.visible").type(digit);
    });

    cy.contains("button", "Verify").click();
    cy.wait(3000);

    // cy.visit("https://tijarah-qa.vercel.app/authentication/payment-gateway");
    cy.contains("label", "Offline", { timeout: 10000 })
      .should("be.visible")
      .click();

    cy.get('div[role="button"]', { timeout: 10000 })
      .first()
      .should("be.visible")
      .click();

    cy.contains("li", "Cash", { timeout: 10000 }).should("be.visible").click();

    cy.get('input[name="transactionId"]', { timeout: 10000 })
      .should("be.visible")
      .clear()
      .type("123456");

    cy.get('input[name="salesPerson"]', { timeout: 10000 })
      .should("be.visible")
      .clear()
      .type("Jagath");

    cy.get('textarea[name="note"]', { timeout: 10000 })
      .should("be.visible")
      .clear()
      .type("This is for the Tijarah T360");

    cy.contains("button", "Submit", { timeout: 10000 })
      .should("be.enabled")
      .click();

    // cy.visit("https://tijarah-qa.vercel.app/signup", {
    //   onBeforeLoad(win) {
    //     win.sessionStorage.setItem(
    //       "susbscriptionData-store",
    //       JSON.stringify(subData)
    //     );
    //   },
    // });
    // Fill the English name of the company
    cy.get('input[name="companyNameEng"]', { timeout: 10000 })
      .should("be.visible")
      .clear({ force: true })
      .type("Tiso Studio", { delay: 50 });

    // Fill the Arabic name of the company
    cy.get('input[name="companyNameAr"]', { timeout: 15000 })
      .should("be.visible")
      .scrollIntoView()
      .clear({ force: true })
      .type("Arabic Tiso", { delay: 50 });

    cy.get('input[id="phone"]').should("be.visible").clear().type("121234589");

    cy.get('input[placeholder="Email"]')
      .should("be.visible")
      .clear()
      .type("tiso@test.com");

    cy.contains("label", "Industry").parent().find('[role="button"]').click();
    cy.contains("li", "Retail").click();

    cy.get('div[id="businessType"]').click().wait(500);
    cy.contains("li", "Restaurant").click();

    cy.get('div[id="currency"]').click().wait(500);
    cy.contains("li", "Riyal (SAR)").click();

    cy.contains("div", "Saudi Arabia").click();

    cy.get('input[name="companyAddressLine1"]')
      .should("be.visible")
      .clear()
      .type("Saudi Arabia, Olaya Street 12345");

    cy.get('input[name="companyPostalCode"]')
      .should("be.visible")
      .clear()
      .type("123456");

    cy.get('input[name="companyCity"]')
      .should("be.visible")
      .clear()
      .type("Riyadh");

    cy.get('input[name="vatNumber"]')
      .should("be.visible")
      .type("3A1234567890123");

    cy.get('svg[aria-hidden="true"]').parent().click();
    cy.contains("13").click();
    cy.contains("May").click();
    cy.contains("2025").click();

    cy.get(".MuiAutocomplete-inputRoot").click();
    cy.contains("15%").click();

    cy.get('input[name="commercialRegistrationNumber"]').type("A1B2C3D4E5");

    cy.get('button[aria-label="Choose date"]').last().click();
    cy.contains("30").click();
    cy.contains("May").click();
    cy.contains("2025").click();

    cy.contains("button", "Next").should("be.visible").click();

    it("Creates a new business location", () => {
      cy.contains("Create New Location").click();

      cy.get('input[placeholder="Location Business Name (English)"]')
        .should("be.visible")
        .type("Tiso Office");

      cy.get('input[placeholder="Location Business Name (Arabic)"]')
        .should("be.visible")
        .type("Arabic Tiso");

      cy.get("#phone").should("be.visible").clear().type("501234567");

      cy.get('input[name="email"]')
        .should("be.visible")
        .clear()
        .type("location@example.com");

      cy.get('[id^="mui-component-select-vat"]').should("be.visible").click();
      cy.wait(500);
      cy.get("li").contains("15%").click();

      cy.get('textarea[placeholder="Brief (English)"]')
        .should("be.visible")
        .clear()
        .type("This is the main office for operations.");

      cy.get('textarea[placeholder="Brief (Arabic)"]')
        .should("be.visible")
        .clear()
        .type("Arabic office description");

      cy.get('[id^="mui-component-select-country"]')
        .should("be.visible")
        .click();
      cy.wait(500);
      cy.get("li").contains("Saudi Arabia").click();

      cy.get('input[placeholder="Address Line 1"]')
        .should("be.visible")
        .type("Hyderabad shaikpet");

      cy.get('input[placeholder="Address Line 2"]')
        .should("be.visible")
        .type("Shaikpet office");

      cy.get('input[placeholder="Postal Code"]')
        .should("be.visible")
        .type("500032");

      cy.get('input[placeholder="City"]').should("be.visible").type("Riyadh");

      cy.get('input[placeholder="Commercial Registration Number"]')
        .should("be.visible")
        .type("CR-123456");

      cy.contains("button", "Create").should("be.enabled").click();
    });

    cy.contains("button", "Next").should("be.visible").click();

    it("Adds a new device and sends it to phone via modal popup", () => {
      cy.contains("Add a Device").click();

      cy.get('div[role="button"]').should("be.visible").click();
      cy.contains("li", "wedwedw , qatar").should("be.visible").click();

      cy.get("input").eq(1).should("be.visible").type("DEVICE 1");

      cy.get("input").eq(2).should("be.visible").clear().type("BJ86MBHP");

      cy.get("input").eq(3).should("be.visible").clear().type("6Q7EZS");

      cy.contains("button", "Create").should("be.enabled").click();

      cy.get('[role="dialog"]')
        .should("be.visible")
        .within(() => {
          cy.contains("button", "Send to Phone").should("be.visible").click();
        });
    });

    cy.contains("button", "Next").should("be.visible").click();

    cy.get("#roleRef").should("be.visible").click();

    cy.get('ul[role="listbox"]')
      .contains("li", /^Admin$/)
      .should("be.visible")
      .click();

    cy.get('select[placeholder="Location *"]')
      .should("be.visible")
      .select("wedwedw , qatar");

    cy.get('input[placeholder="Full Name *"]')
      .should("be.visible")
      .type("Tester");

    cy.get('input[placeholder="Email Address *"]')
      .should("be.visible")
      .type("tester1@gmail.com");

    cy.get('input[placeholder="Phone Number *"]')
      .should("be.visible")
      .type("512345678");

    cy.get('input[placeholder="Web Password *"]')
      .should("be.visible")
      .type("Password123!");

    cy.get('input[name="confirmPassword"]')
      .should("be.visible")
      .type("Password123!");

    cy.get('input[id^="roleRef"]').should("be.visible").clear().type("1234");

    cy.contains("button", "Create").should("be.enabled").click();

    cy.get('input[name="importGlobalProducts"]').check({ force: true });
    cy.get('input[name="importGlobalProducts"]').should("be.checked");
    cy.contains("button", "Finish").click();
  });
});
