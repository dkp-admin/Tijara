import ObjectID from "bson-objectid";

export class BsonObjectIdTransformer {
  to(value: any) {
    if (value || value !== undefined) {
      return "" + new ObjectID(value);
    }

    return "" + new ObjectID();
  }
  from(value: string) {
    // Do nothing
    return value;
  }
}

export function objectId() {
  return "" + new ObjectID();
}
