import { BaseRepository } from "./base-repository";
import {
  KitchenManagement,
  ProductData,
  CategoryData,
  DeviceInfo,
} from "../schema/kitchen-management";

export class KitchenManagementRepository extends BaseRepository<
  KitchenManagement,
  string
> {
  constructor() {
    super("kitchen-management");
  }

  async create(kitchen: KitchenManagement): Promise<KitchenManagement> {
    const now = new Date().toISOString();
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO "kitchen-management" (
        _id, company, companyRef, location, locationRef,
        name, description, allProducts, allCategories, productRefs,
        categoryRefs, products, categories, printerName, printerAssigned,
        device, deviceRef, status, createdAt, updatedAt, source
      ) VALUES (
        $id, $company, $companyRef, $location, $locationRef,
        $name, $description, $allProducts, $allCategories, $productRefs,
        $categoryRefs, $products, $categories, $printerName, $printerAssigned,
        $device, $deviceRef, $status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $source
      )
      ON CONFLICT(_id) DO UPDATE SET
        company = $company,
        companyRef = $companyRef,
        location = $location,
        locationRef = $locationRef,
        name = $name,
        description = $description,
        allProducts = $allProducts,
        allCategories = $allCategories,
        productRefs = $productRefs,
        categoryRefs = $categoryRefs,
        products = $products,
        categories = $categories,
        printerName = $printerName,
        printerAssigned = $printerAssigned,
        device = $device,
        deviceRef = $deviceRef,
        status = $status,
        updatedAt = CURRENT_TIMESTAMP,
        source = $source
    `);

    const params: any = {
      $id: kitchen._id,
      $company: JSON.stringify(kitchen.company),
      $companyRef: kitchen.companyRef,
      $location: JSON.stringify(kitchen.location),
      $locationRef: kitchen.locationRef,
      $name: JSON.stringify(kitchen.name),
      $description: kitchen.description,
      $allProducts: Number(kitchen.allProducts) || 0,
      $allCategories: Number(kitchen.allCategories) || 0,
      $productRefs: JSON.stringify(kitchen.productRefs),
      $categoryRefs: JSON.stringify(kitchen.categoryRefs),
      $products: JSON.stringify(kitchen.products),
      $categories: JSON.stringify(kitchen.categories),
      $printerName: kitchen.printerName || null,
      $printerAssigned: Number(kitchen.printerAssigned) || 0,
      $device: kitchen.device ? JSON.stringify(kitchen.device) : null,
      $deviceRef: kitchen.deviceRef || null,
      $status: kitchen.status,
      $createdAt: kitchen.createdAt || now,
      $updatedAt: kitchen.updatedAt || now,
      $source: kitchen.source,
    };

    try {
      const result = await statement.executeAsync(params);
      const created = await result.getFirstAsync();
      return created ? KitchenManagement.fromRow(created) : kitchen;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async createMany(
    kitchens: KitchenManagement[]
  ): Promise<KitchenManagement[]> {
    const columns = [
      "_id",
      "company",
      "companyRef",
      "location",
      "locationRef",
      "name",
      "description",
      "allProducts",
      "allCategories",
      "productRefs",
      "categoryRefs",
      "products",
      "categories",
      "printerName",
      "printerAssigned",
      "device",
      "deviceRef",
      "status",
      "source",
    ];

    const generateParams = (kitchen: KitchenManagement) => {
      const toRow = KitchenManagement.toRow(kitchen);
      return [
        toRow._id,
        toRow.company,
        toRow.companyRef,
        toRow.location,
        toRow.locationRef,
        toRow.name,
        toRow.description,
        toRow.allProducts || 0,
        toRow.allCategories || 0,
        toRow.productRefs,
        toRow.categoryRefs,
        toRow.products,
        toRow.categories,
        toRow.printerName || null,
        toRow.printerAssigned || 0,
        toRow.device,
        toRow.deviceRef || null,
        toRow.status,
        toRow.source,
      ];
    };

    return this.createManyGeneric(
      "kitchen-management",
      kitchens,
      columns,
      generateParams
    );
  }

  async update(
    id: string,
    kitchen: KitchenManagement
  ): Promise<KitchenManagement> {
    const now = new Date().toISOString();
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "kitchen-management" SET
        company = $company,
        companyRef = $companyRef,
        location = $location,
        locationRef = $locationRef,
        name = $name,
        description = $description,
        allProducts = $allProducts,
        allCategories = $allCategories,
        productRefs = $productRefs,
        categoryRefs = $categoryRefs,
        products = $products,
        categories = $categories,
        printerName = $printerName,
        printerAssigned = $printerAssigned,
        device = $device,
        deviceRef = $deviceRef,
        status = $status,
        updatedAt = CURRENT_TIMESTAMP,
        source = $source
      WHERE _id = $id
    `);

    const params = {
      $id: id,
      $company: JSON.stringify(kitchen.company),
      $companyRef: kitchen.companyRef,
      $location: JSON.stringify(kitchen.location),
      $locationRef: kitchen.locationRef,
      $name: JSON.stringify(kitchen.name),
      $description: kitchen.description,
      $allProducts: Number(kitchen.allProducts),
      $allCategories: Number(kitchen.allCategories),
      $productRefs: JSON.stringify(kitchen.productRefs),
      $categoryRefs: JSON.stringify(kitchen.categoryRefs),
      $products: JSON.stringify(kitchen.products),
      $categories: JSON.stringify(kitchen.categories),
      $printerName: kitchen.printerName || null,
      $printerAssigned: Number(kitchen.printerAssigned),
      $device: kitchen.device ? JSON.stringify(kitchen.device) : null,
      $deviceRef: kitchen.deviceRef || null,
      $status: kitchen.status,
      $updatedAt: now,
      $source: kitchen.source,
    };

    try {
      const result = await statement.executeAsync(params);
      kitchen._id = id;
      kitchen.updatedAt = now;
      return kitchen;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async delete(id: string): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM "kitchen-management" WHERE _id = $id
    `);

    try {
      await statement.executeAsync({ $id: id });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findById(id: string): Promise<KitchenManagement> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "kitchen-management" WHERE _id = $id
    `);

    try {
      const result = await statement.executeAsync({ $id: id });
      const row = await result.getFirstAsync();
      if (!row) {
        throw new Error("Kitchen management not found");
      }
      return KitchenManagement.fromRow(row);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findAll(): Promise<KitchenManagement[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "kitchen-management"
    `);

    try {
      const result = await statement.executeAsync({});
      const rows = await result.getAllAsync();
      return rows.map((row) => KitchenManagement.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByLocation(locationRef: string): Promise<KitchenManagement[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "kitchen-management" 
      WHERE locationRef = $locationRef
      AND status = 'active'
    `);

    try {
      const result = await statement.executeAsync({
        $locationRef: locationRef,
      });
      const rows = await result.getAllAsync();
      return rows.map((row) => KitchenManagement.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByDevice(deviceRef: string): Promise<KitchenManagement | null> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "kitchen-management" 
      WHERE deviceRef = $deviceRef
      AND status = 'active'
    `);

    try {
      const result = await statement.executeAsync({ $deviceRef: deviceRef });
      const row = await result.getFirstAsync();
      return row ? KitchenManagement.fromRow(row) : null;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findForProduct(
    productRef: string,
    locationRef: string
  ): Promise<KitchenManagement[]> {
    const statement = await this.db.getConnection().prepareAsync(`
     SELECT * FROM "kitchen-management" 
WHERE locationRef = $locationRef
AND status = 'active'
AND (
  allProducts = 1
  OR productRefs LIKE '%' || $productRef || '%'
)
    `);

    try {
      const result = await statement.executeAsync({
        $locationRef: locationRef,
        $productRef: productRef,
      });
      const rows = await result.getAllAsync();
      return rows.map((row) => KitchenManagement.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findForCategory(
    categoryRef: string,
    locationRef: string
  ): Promise<KitchenManagement[]> {
    const statement = await this.db.getConnection().prepareAsync(`
     SELECT * FROM "kitchen-management" 
WHERE locationRef = $locationRef
AND status = 'active'
AND (
  allCategories = 1
  OR categoryRefs LIKE '%' || $categoryRef || '%'
)
    `);

    try {
      const result = await statement.executeAsync({
        $locationRef: locationRef,
        $categoryRef: categoryRef,
      });
      const rows = await result.getAllAsync();
      return rows.map((row) => KitchenManagement.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateProducts(
    id: string,
    products: ProductData[]
  ): Promise<KitchenManagement> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "kitchen-management" SET
        products = $products,
        productRefs = $productRefs,
        updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
        $products: JSON.stringify(products),
        $productRefs: JSON.stringify(products.map((p) => p.productRef)),
      });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateCategories(
    id: string,
    categories: CategoryData[]
  ): Promise<KitchenManagement> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "kitchen-management" SET
        categories = $categories,
        categoryRefs = $categoryRefs,
        updatedAt = $updatedAt
      WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
        $categories: JSON.stringify(categories),
        $categoryRefs: JSON.stringify(categories.map((c) => c.categoryRef)),
      });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async assignPrinter(
    id: string,
    printerName: string
  ): Promise<KitchenManagement> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "kitchen-management" SET
        printerName = $printerName,
        printerAssigned = 1,
        updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
        $printerName: printerName,
      });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async unassignPrinter(id: string): Promise<KitchenManagement> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "kitchen-management" SET
        printerName = NULL,
        printerAssigned = 0,
        updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
      });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async assignDevice(
    id: string,
    deviceRef: string,
    deviceCode: string
  ): Promise<KitchenManagement> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "kitchen-management" SET
        deviceRef = $deviceRef,
        device = $device,
        updatedAt = $updatedAt
      WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
        $deviceRef: deviceRef,
        $device: JSON.stringify(new DeviceInfo(deviceCode)),
        $updatedAt: new Date().toISOString(),
      });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async unassignDevice(id: string): Promise<KitchenManagement> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "kitchen-management" SET
        deviceRef = NULL,
        device = NULL,
        updatedAt = $updatedAt
      WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
        $updatedAt: new Date().toISOString(),
      });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateStatus(id: string, status: string): Promise<KitchenManagement> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "kitchen-management" SET
        status = $status,
        updatedAt = $updatedAt
      WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
        $status: status,
        $updatedAt: new Date().toISOString(),
      });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }
}
