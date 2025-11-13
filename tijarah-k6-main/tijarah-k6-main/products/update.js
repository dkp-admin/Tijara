import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import { check, sleep } from "k6";
import http from "k6/http";
import ObjectID from "../utils/bson-objectid.js";
import endpoints from "../api/endpoints.js";
import faker from "https://cdnjs.cloudflare.com/ajax/libs/Faker/3.1.0/faker.min.js";

const data = {
  updateOne: {
    filter: {
      _id: "6748bf0976f8d3b2e638865b",
    },
    update: {
      _id: "6748bf0976f8d3b2e638865b",
      name: {
        en: "Almond Shake",
        ar: "Almond Shake",
      },
      kitchenFacingName: {
        en: "",
        ar: "",
      },
      image: "",
      description: "",
      modifiers: [],
      company: {
        name: "Pista House Restaurant",
      },
      companyRef: "6720c4d89ce196e9e3243075",
      categoryRef: "6720c6c5464cd9e21a75e597",
      category: {
        name: "DRINKS",
      },
      collectionRefs: [],
      kitchenRefs: [],
      collections: [],
      restaurantCategoryRefs: ["6720c6c5464cd9e21a75e597"],
      restaurantCategories: [
        {
          name: "DRINKS",
        },
      ],
      assignedToAllCategories: false,
      brandRef: "6509ad385d7c1707735848e3",
      brand: {
        name: "Random Brand",
      },
      taxRef: "6509a94665dc08019b0b020e",
      tax: {
        percentage: 15,
      },
      isLooseItem: false,
      variants: [
        {
          name: {
            en: "regular",
            ar: "regular.ar",
          },
          sku: "9496919054224",
          code: "",
          type: "item",
          image: "",
          unitCount: 1,
          unit: "perItem",
          price: 12,
          costPrice: 10,
          prices: [
            {
              locationRef: "6720c50e9ce196e9e32430d6",
              location: {
                name: "Pista Huse Hitech City - Hyderabad",
              },
              price: 12,
              costPrice: 10,
              overriden: false,
            },
            {
              locationRef: "6720c5df9ce196e9e32431e3",
              location: {
                name: "Mandi King",
              },
              price: 12,
              costPrice: 10,
              overriden: false,
            },
            {
              locationRef: "6729ca9790d0ca422fb33079",
              location: {
                name: "ALSABA RESTORAN",
              },
              price: 12,
              costPrice: 10,
              overriden: false,
            },
          ],
          assignedToAll: true,
          nonSaleable: false,
          locationRefs: [
            "6720c50e9ce196e9e32430d6",
            "6720c5df9ce196e9e32431e3",
            "6729ca9790d0ca422fb33079",
          ],
          locations: [
            {
              name: "Pista Huse Hitech City - Hyderabad",
            },
            {
              name: "Mandi King",
            },
            {
              name: "ALSABA RESTORAN",
            },
          ],
          stocks: [
            {
              availability: true,
              tracking: false,
              count: 0,
              lowStockAlert: false,
              lowStockCount: 0,
              locationRef: "6720c50e9ce196e9e32430d6",
              location: {
                name: "Pista Huse Hitech City - Hyderabad",
              },
            },
            {
              availability: true,
              tracking: false,
              count: 0,
              lowStockAlert: false,
              lowStockCount: 0,
              locationRef: "6720c5df9ce196e9e32431e3",
              location: {
                name: "Mandi King",
              },
            },
            {
              availability: true,
              tracking: false,
              count: 0,
              lowStockAlert: false,
              lowStockCount: 0,
              locationRef: "6729ca9790d0ca422fb33079",
              location: {
                name: "ALSABA RESTORAN",
              },
            },
          ],
          status: "active",
        },
      ],
      boxes: [],
      batching: false,
      status: "active",
      pushed: false,
      nutritionalInformation: {
        calorieCount: null,
        preference: [],
        contains: [],
        assignedToAllPreferrence: false,
        assignedToAllItems: false,
      },
      bestSeller: false,
      contains: "veg",
      channel: ["dine-in", "takeaway", "pickup", "delivery", "Swiggy"],
      selfOrdering: true,
      onlineOrdering: true,
      isComposite: false,
      reduceFromOriginal: false,
      boxRefs: [],
      crateRefs: [],
      kitchens: [],
      productBeforeUpdate: [],
      compositeProductItems: [],
      createdAt: "2024-11-28T19:05:45.360Z",
      updatedAt: "2024-11-28T19:05:45.360Z",
    },
  },
};

export default async function update({ token }) {
  for (let i = 0; i < randomIntBetween(1, 5); i++) {
    const requestId = new ObjectID().toString();
    const operations = [];

    for (let j = 0; j < randomIntBetween(1, 10); j++) {
      const operationData = JSON.parse(JSON.stringify(data.updateOne.update));

      operationData.name.en = faker.commerce.productName();
      operationData.name.ar = faker.commerce.productName() + " (AR)";
      operationData._id = operationData._id;

      const dataString = {
        updateOne: {
          filter: { _id: operationData._id },
          update: operationData,
        },
      };

      operations.push({
        id: j,
        requestId: ObjectID(),
        data: JSON.stringify(dataString),
        tableName: "orders",
        action: "UPDATE",
        timestamp: new Date().toISOString(),
        status: "pending",
      });
    }

    const pushRes = http.post(
      endpoints.push.products,
      JSON.stringify({ requestId, operations }),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    check(pushRes, {
      accepted: (r) => r.status === 201,
    });
  }

  const hardcodedRequestId = new ObjectID().toString();
  const hardcodedOperationData = JSON.parse(
    JSON.stringify(data.updateOne.update)
  );

  hardcodedOperationData.name.en = "Hardcoded Almond Shake";
  hardcodedOperationData.name.ar = "هاردكود Almond Shake";
  hardcodedOperationData._id = hardcodedOperationData._id;

  const hardcodedDataString = {
    updateOne: {
      filter: { _id: hardcodedOperationData._id },
      update: hardcodedOperationData,
    },
  };

  const finalPushRes = http.post(
    endpoints.push.products,
    JSON.stringify({
      requestId: hardcodedRequestId,
      operations: [
        {
          id: 1,
          requestId: ObjectID(),
          data: JSON.stringify(hardcodedDataString),
          tableName: "orders",
          action: "UPDATE",
          timestamp: new Date().toISOString(),
          status: "pending",
        },
      ],
    }),
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  check(finalPushRes, {
    finalAccepted: (r) => r.status === 201,
  });
}
