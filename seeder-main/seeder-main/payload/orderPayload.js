var products = [
  {
    _id: "657f628989379d277233ad9f",
    parent: "657f3b7206aa476306ba0897",
    name: {
      en: "Mouchoir Jumbo Paper Towel 8 Rolls",
      ar: "مناديل ورقيه عملاقه مشوار ٨ رول",
    },
    image: "",
    localImage: "",
    companyRef: "657f614389379d277233ace7",
    company: {
      name: "Taqi al-Din supermarket",
    },
    categoryRef: "657f628906aa476306c39fa4",
    category: {
      name: "Medicinal",
    },
    collections: [],
    description: "",
    brandRef: "657c1b8606aa4763060d3ace",
    brand: {
      name: "Meshwar",
    },
    taxRef: "657bfc85638d80bcfc1cb6e9",
    tax: {
      percentage: "15",
    },
    status: "active",
    enabledBatching: false,
    variants: [
      {
        _id: "657f628989379d277233ada0",
        parentSku: "",
        parentName: {
          en: "",
          ar: "",
        },
        type: "item",
        assignedToAll: true,
        name: {
          en: "Regular",
          ar: "عادي",
        },
        image: "",
        localImage: "",
        sku: "6281101534814",
        unit: "perItem",
        noOfUnits: 0,
        costPrice: "16",
        sellingPrice: "16",
        locationRefs: ["657f61f389379d277233ad08"],
        locations: [
          {
            name: "riyadh",
          },
        ],
        prices: [
          {
            costPrice: "16",
            price: "16",
            locationRef: "657f61f389379d277233ad08",
            location: {
              name: "riyadh",
            },
          },
        ],
        otherPrices: [],
        stocks: [],
        otherStocks: [],
        status: "active",
      },
    ],
    otherVariants: [],
    boxes: [],
    otherBoxes: [],
    sku: ["6281101534814"],
    source: "server",
  },
  {
    _id: "657f628989379d277233adac",
    parent: "657f3b7206aa476306ba0898",
    name: {
      en: "Alrahden Laundry Detergent 2.5 K",
      ar: "مسحوق غسيل بقوة البوليمر الرهدن ٢.٥ ك",
    },
    image: "",
    localImage: "",
    companyRef: "657f614389379d277233ace7",
    company: {
      name: "Taqi al-Din supermarket",
    },
    categoryRef: "657f628906aa476306c39f8a",
    category: {
      name: "Miscellaneous",
    },
    collections: [],
    description: "",
    brandRef: "657c1b8606aa4763060d39d8",
    brand: {
      name: "Alrahden",
    },
    taxRef: "657bfc85638d80bcfc1cb6e9",
    tax: {
      percentage: "15",
    },
    status: "active",
    enabledBatching: false,
    variants: [
      {
        _id: "657f628989379d277233adad",
        parentSku: "",
        parentName: {
          en: "",
          ar: "",
        },
        type: "item",
        assignedToAll: true,
        name: {
          en: "Regular",
          ar: "عادي",
        },
        image: "",
        localImage: "",
        sku: "6904542109839",
        unit: "perItem",
        noOfUnits: 0,
        costPrice: "25",
        sellingPrice: "25",
        locationRefs: ["657f61f389379d277233ad08"],
        locations: [
          {
            name: "riyadh",
          },
        ],
        prices: [
          {
            costPrice: "25",
            price: "25",
            locationRef: "657f61f389379d277233ad08",
            location: {
              name: "riyadh",
            },
          },
        ],
        otherPrices: [],
        stocks: [],
        otherStocks: [],
        status: "active",
      },
    ],
    otherVariants: [],
    boxes: [],
    otherBoxes: [],
    sku: ["6904542109839"],
    source: "server",
  },
];

function getRandomNumber() {
  return Math.floor(Math.random() * 10) + 4;
}

function generateRandomString(length) {
  const characters = "0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function generateRandomOrderNum(length) {
  const characters = "0123456789ABCDEFGHIJKLMOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function pickRandomProducts(products, count) {
  const shuffled = products.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomDate(start, end) {
  let date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );

  // Generate a random time between 8:30 AM (8 * 60 + 30 minutes) and 11:30 PM (23 * 60 + 30 minutes)
  let minTime = 8 * 60 + 30; // 8:30 AM in minutes
  let maxTime = 23 * 60 + 30; // 11:30 PM in minutes
  let randomTime = minTime + Math.random() * (maxTime - minTime);

  // Set hours and minutes to the date
  date.setHours(Math.floor(randomTime / 60));
  date.setMinutes(Math.floor(randomTime % 60));
  date.setSeconds(0); // Setting seconds and milliseconds to 0 for consistency
  date.setMilliseconds(0);

  return date;
}

// Usage
var startDate = new Date("2023-10-01T00:00:00.000Z");
var endDate = new Date("2023-12-16T23:59:59.999Z");
var randomTimestamp = randomDate(startDate, endDate);
var formattedDate = randomTimestamp.toISOString();

const selectedProducts = pickRandomProducts(products, getRandomNumber());
const items = selectedProducts.map((product) => ({
  categoryRef: product.categoryRef,
  productRef: product._id,
  image: "",
  name: product.name,
  variantNameEn: "Regular",
  variantNameAr: "عادي",
  type: "item",
  sku: product.variants[0].sku,
  parentSku: "",
  qty: 1,
  costPrice: product.variants[0].costPrice,
  sellingPrice: product.variants[0].sellingPrice,
  total: product.variants[0].sellingPrice,
  unit: "perItem",
  // vat: (product.variants[0].price * vatPercentage) / 100,
  vat:
    product.variants[0].sellingPrice - product.variants[0].sellingPrice / 1.15,
  vatPercentage: 15,
  discount: 0,
  discountPercentage: 0,
  note: "",
  refundedQty: 0,
  noOfUnits: 1,
  availability: true,
  tracking: false,
  stockCount: 0,
}));

const subTotalWithoutDiscount = items.reduce(
  (acc, item) => acc + item.sellingPrice / 1.15,
  0
);
const totalVat = items.reduce((acc, item) => acc + item.vat, 0);
const total = subTotalWithoutDiscount + totalVat;

const payment = {
  total: total,
  vat: totalVat,
  vatPercentage: "15",
  subTotal: subTotalWithoutDiscount,
  discount: 0,
  discountPercentage: 0,
  discountCode: "",
  vatWithoutDiscount: totalVat,
  subTotalWithoutDiscount: subTotalWithoutDiscount,
  breakup: [
    {
      name: "Cash",
      total: total,
      refId: "Cash",
      providerName: "cash",
      createdAt: formattedDate,
      change: 0,
    },
  ],
};

var docId = "658429e6bfcb58" + generateRandomString(10);
var reqId = "658429e6cfcb58" + generateRandomString(10);
var orderNum = generateRandomOrderNum(6);

const operation = {
  action: "INSERT",
  data: JSON.stringify({
    insertOne: {
      document: {
        _id: docId,
        items: items,
        customer: {
          name: "",
          vat: "",
        },
        payment: payment,
        orderNum: orderNum,
        tokenNum: "",
        showToken: false,
        showOrderType: false,
        orderType: "Walk-in",
        company: { name: "Taqi al-Din supermarket" },
        companyRef: "657f614389379d277233ace7",
        cashier: { name: "mumtaz" },
        cashierRef: "657f622789379d277233ad45",
        device: { deviceCode: "96MHS7YM" },
        deviceRef: "657f61fb89379d277233ad25",
        locationRef: "657f61f389379d277233ad08",
        location: { name: "riyadh" },
        createdAt: formattedDate,
        refunds: [],
        appliedDiscount: false,
        paymentMethod: ["cash"],
        refundAvailable: false,
        phone: "+966-502323023",
        vat: "",
        address: "road no 5,riyadh",
        footer: "Thank You",
        returnPolicyTitle: "Return Policy",
        returnPolicy: "",
        customText: "",
        noOfPrints: [1],
        source: "local",
      },
    },
  }),
  id: 15,
  requestId: reqId,
  status: "pending",
  tableName: "orders",
  timestamp: formattedDate,
};

export const orderPayload = {
  operations: [operation],
  requestId: reqId,
};
