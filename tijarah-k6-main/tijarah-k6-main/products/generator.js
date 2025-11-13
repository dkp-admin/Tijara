import faker from "https://cdnjs.cloudflare.com/ajax/libs/Faker/3.1.0/faker.min.js";
import ObjectID from "../utils/bson-objectid.js";

export const generateProduct = ({
  companyRef,
  company,
  locationRef,
  location,
  category,
  brand,
  tax,
}) => {
  const sku = faker.random.uuid().slice(0, 10);

  const product = {
    _id: ObjectID(),
    parent: "",
    name: {
      en: faker.commerce.productName(),
      ar: faker.commerce.productName(),
    },
    image: faker.image.imageUrl(),
    localImage: faker.image.imageUrl(),
    companyRef,
    company: { name: company.name.en },
    categoryRef: category._id,
    category: {
      name: category.name.en,
    },
    collections: [],
    description: faker.lorem.paragraph(),
    brandRef: brand._id,
    brand: {
      name: brand.name.en,
    },
    taxRef: tax._id,
    tax: {
      percentage: tax.percentage || 15,
    },
    status: "active",
    source: "local",
    enabledBatching: true,
    variants: [
      {
        _id: ObjectID(),
        parentSku: "",
        parentName: {
          en: "",
          ar: "",
        },
        type: "item",
        assignedToAll: false,
        name: {
          en: faker.commerce.productName(),
          ar: faker.commerce.productName(),
        },
        image: faker.image.imageUrl(),
        localImage: faker.image.imageUrl(),
        sku: sku,
        unit: "perItem",
        noOfUnits: 1,
        costPrice: faker.commerce.price(),
        sellingPrice: faker.commerce.price(),
        locationRefs: [locationRef],
        locations: [
          {
            name: location.name,
          },
        ],
        prices: [
          {
            costPrice: faker.commerce.price(),
            price: faker.commerce.price(),
            locationRef,
            location: {
              name: location.name,
            },
          },
        ],
        otherPrices: [
          {
            costPrice: faker.commerce.price(),
            price: faker.commerce.price(),
            locationRef,
            location: {
              name: location.name,
            },
          },
        ],
        stocks: [
          {
            enabledAvailability: true,
            enabledTracking: true,
            stockCount: faker.random.number({ min: 0, max: 100 }),
            enabledLowStockAlert: false,
            lowStockCount: 0,
            locationRef,
            location: {
              name: location.name,
            },
          },
        ],
        otherStocks: [
          {
            enabledAvailability: true,
            enabledTracking: false,
            stockCount: 0,
            enabledLowStockAlert: false,
            lowStockCount: 0,
            locationRef,
            location: {
              name: location.name,
            },
          },
        ],
        status: "active",
      },
    ],
    otherVariants: [],
    boxes: [
      {
        parentSku: faker.random.uuid(),
        parentName: {
          en: faker.commerce.productName(),
          ar: faker.commerce.productName(),
        },
        type: "box",
        assignedToAll: true,
        name: {
          en: faker.commerce.productName(),
          ar: faker.commerce.productName(),
        },
        image: faker.image.imageUrl(),
        localImage: faker.image.imageUrl(),
        sku: faker.random.uuid(),
        unit: "perItem",
        noOfUnits: 10,
        costPrice: faker.commerce.price(),
        sellingPrice: faker.commerce.price(),
        locationRefs: [locationRef],
        locations: [
          {
            name: location.name,
          },
        ],
        prices: [
          {
            costPrice: faker.commerce.price(),
            price: faker.commerce.price(),
            locationRef,
            location: {
              name: location.name,
            },
          },
        ],
        otherPrices: [
          {
            costPrice: faker.commerce.price(),
            price: faker.commerce.price(),
            locationRef,
            location: {
              name: location.name,
            },
          },
        ],
        stocks: [],
        otherStocks: [],
        status: "active",
      },
    ],
    otherBoxes: [],
    sku: [sku, faker.random.uuid()],
  };

  return product;
};
