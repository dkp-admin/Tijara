import {
  randomIntBetween,
  randomString,
} from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import ObjectID from "../utils/bson-objectid.js";

function generatePushOrdersPayload(items) {
  const item = items[0];

  const companyRef = item.companyRef;
  const company = item.company;
  const locationRef = item.locationRef;
  const location = item.location;
  const cashier = item.cashier;
  const cashierRef = item.cashierRef;
  const device = item.device;
  const deviceRef = item.deviceRef;
  const vatPercentage = 15;
  let total = 0;
  let vatTotal = 0;

  // Process each item to calculate total and VAT
  items.forEach((item) => {
    const itemTotal = parseFloat(item.sellingPrice) * item.qty;
    const itemVat = (itemTotal * vatPercentage) / 100;

    item.total = (itemTotal + itemVat).toFixed(2);
    item.vat = itemVat.toFixed(2);
    item.vatPercentage = 15;
    item.discountPercentage = 0;
    item.discount = 0;

    total += isNaN(itemTotal + itemVat) ? 100 : itemTotal + itemVat;
    vatTotal += itemVat;
  });

  const id = ObjectID();

  // Prepare the JSON object
  const json = {
    id: randomIntBetween(1, 10),
    requestId: id,
    data: JSON.stringify({
      insertOne: {
        document: {
          company,
          companyRef,
          location,
          locationRef,
          cashierRef,
          cashier,
          device,
          deviceRef,
          _id: id,
          items: items,
          orderNum: randomString(6),
          payment: {
            total: total.toFixed(2),
            vat: vatTotal.toFixed(2),
            vatPercentage: vatPercentage.toString(),
            subTotal: (total - vatTotal).toFixed(2),
            discount: 0,
            discountPercentage: 0,
            discountCode: "",
            vatWithoutDiscount: vatTotal.toFixed(2),
            subTotalWithoutDiscount: (total - vatTotal).toFixed(2),
            breakup: [
              {
                name: "Cash",
                total: total.toFixed(2),
                refId: "Cash",
                providerName: "cash",
                createdAt: new Date(
                  +new Date() - Math.floor(Math.random() * 10000000000)
                ).toISOString(),
                change: 0,
              },
            ],
            createdAt: new Date(
              +new Date() - Math.floor(Math.random() * 10000000000)
            ).toISOString(),
          },
          createdAt: new Date().toISOString(),
        },
      },
    }),
    status: "pending",
    tableName: "orders",
    timestamp: new Date(
      +new Date() - Math.floor(Math.random() * 10000000000)
    ).toISOString(),
  };

  const payload = {
    requestId: "",
    operations: [json],
  };

  return payload;
}

export default generatePushOrdersPayload;
